// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getPiperXEarlyValidationError } from '@subwallet/extension-base/core/logic-validation';
import { getERC20Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getChainNativeTokenSlug, _getContractAddressOfToken, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import { BaseStepDetail, BasicTxErrorType, CommonFeeComponent, CommonOptimalPath, CommonStepFeeInfo, CommonStepType, HandleYieldStepData, OptimalSwapPathParams, PiperXValidationMetadata, SwapBaseTxData, SwapEarlyValidation, SwapErrorType, SwapFeeType, SwapProviderId, SwapQuote, SwapRequest, SwapStepType, SwapSubmitParams, SwapSubmitStepData, TokenSpendingApprovalParams, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import BigN, { BigNumber } from 'bignumber.js';
import { TransactionConfig } from 'web3-core';

import { calculateSwapRate, SWAP_QUOTE_TIMEOUT_MAP } from '../../utils';
import { SwapBaseHandler, SwapBaseInterface } from '../base-handler';
import { PIPERX_SWAP_ADDRESSES } from './constant';
import { checkSwapVersion, routerTokenApproval, routingExactInput, swap } from './core';

function calculateMinReceive (toAmount: string, slippage: number): bigint {
  const bnToAmount = new BigNumber(toAmount);
  const minReceive = bnToAmount.multipliedBy(1 - slippage).toFixed(0);

  return BigInt(minReceive);
}

export class PiperXSwapHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  providerSlug: SwapProviderId;
  isTestnet: boolean;

  constructor (chainService: ChainService, balanceService: BalanceService, isTestnet = true) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      providerName: isTestnet ? 'PiperX Testnet' : 'PiperX',
      providerSlug: isTestnet ? SwapProviderId.PIPERX_TESTNET : SwapProviderId.PIPERX_MAINNET
    });
    this.providerSlug = isTestnet ? SwapProviderId.PIPERX_TESTNET : SwapProviderId.PIPERX_MAINNET;
    this.isTestnet = isTestnet;
  }

  get chainService () {
    return this.swapBaseHandler.chainService;
  }

  get balanceService () {
    return this.swapBaseHandler.balanceService;
  }

  get providerInfo () {
    return this.swapBaseHandler.providerInfo;
  }

  get name () {
    return this.swapBaseHandler.name;
  }

  get slug () {
    return this.swapBaseHandler.slug;
  }

  get chainSetting () {
    if (this.isTestnet) {
      return 'testnet';
    } else {
      return 'mainnet';
    }
  }

  public validateSwapRequest (request: SwapRequest): Promise<SwapEarlyValidation> {
    try {
      const fromAsset = this.chainService.getAssetBySlug(request.pair.from);
      const toAsset = this.chainService.getAssetBySlug(request.pair.to);

      if (!fromAsset || !toAsset) {
        return Promise.resolve({ error: SwapErrorType.ERROR_FETCHING_QUOTE });
      }

      const amount = request.fromAmount;
      const bnAmount = BigInt(amount);

      if (bnAmount <= BigInt(0)) {
        return Promise.resolve({
          error: SwapErrorType.AMOUNT_CANNOT_BE_ZERO,
          metadata: {
            chain: this.chainService.getChainInfoByKey(fromAsset.originChain)
          } as PiperXValidationMetadata
        });
      }
    } catch (e) {
      console.error(e);

      return Promise.resolve({ error: SwapErrorType.UNKNOWN });
    }

    return Promise.resolve({});
  }

  async getSwapQuote (request: SwapRequest): Promise<SwapQuote | SwapError> {
    const fromAsset = this.chainService.getAssetBySlug(request.pair.from);
    const toAsset = this.chainService.getAssetBySlug(request.pair.to);

    if (!fromAsset || !toAsset) {
      return new SwapError(SwapErrorType.UNKNOWN);
    }

    const earlyValidation = await this.validateSwapRequest(request);

    const metadata = earlyValidation.metadata as PiperXValidationMetadata;

    if (earlyValidation.error) {
      return _getPiperXEarlyValidationError(earlyValidation.error, metadata);
    }

    const fromChain = this.chainService.getChainInfoByKey(fromAsset.originChain);
    const fromChainNativeTokenSlug = _getChainNativeTokenSlug(fromChain);
    const evmApi = this.chainService.getEvmApi(fromAsset.originChain);

    const fromAmount = BigInt(request.fromAmount);
    const fromContract = _getContractAddressOfToken(fromAsset) || PIPERX_SWAP_ADDRESSES[this.chainSetting].WIP_ADDRESS;
    const toContract = _getContractAddressOfToken(toAsset) || PIPERX_SWAP_ADDRESSES[this.chainSetting].WIP_ADDRESS;
    const router = await routingExactInput(fromContract, toContract, fromAmount, request.address, evmApi, this.chainSetting);

    const defaultFeeToken = _isNativeToken(fromAsset) ? fromAsset.slug : fromChainNativeTokenSlug;
    const toAmount = router.maxAmountOut.toString();
    const minReceive = calculateMinReceive(toAmount, request.slippage);

    const extrinsic: TransactionConfig = await swap(fromAmount, minReceive, router.bestRoute, request.address, BigInt(3000000000), evmApi, this.chainSetting);
    const gasLimit = extrinsic.gas;

    let networkFeeAmount;

    if (extrinsic.maxFeePerGas && gasLimit) {
      networkFeeAmount = new BigN(extrinsic.maxFeePerGas.toString()).multipliedBy(gasLimit).toFixed(0);
    }

    const networkFee: CommonFeeComponent = {
      tokenSlug: fromChainNativeTokenSlug,
      amount: networkFeeAmount?.toString() || '0', // todo
      feeType: SwapFeeType.NETWORK_FEE
    };

    try {
      return {
        pair: request.pair,
        fromAmount: request.fromAmount,
        toAmount: toAmount,
        rate: calculateSwapRate(request.fromAmount, toAmount, fromAsset, toAsset),
        provider: this.providerInfo,
        aliveUntil: +Date.now() + (SWAP_QUOTE_TIMEOUT_MAP[this.slug] || SWAP_QUOTE_TIMEOUT_MAP.default),
        feeInfo: {
          feeComponent: [networkFee],
          defaultFeeToken,
          feeOptions: [defaultFeeToken]
        },
        metadata: router.bestRoute,
        route: {
          path: [fromAsset.slug, toAsset.slug]
        }
      } as SwapQuote;
    } catch (e) {
      return new SwapError(SwapErrorType.ERROR_FETCHING_QUOTE);
    }
  }

  generateOptimalProcess (params: OptimalSwapPathParams): Promise<CommonOptimalPath> {
    return this.swapBaseHandler.generateOptimalProcess(params, [
      this.getApprovalStep,
      this.getSubmitStep
    ]);
  }

  async getSubmitStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (params.selectedQuote) {
      const submitStep = {
        name: 'Swap',
        type: SwapStepType.SWAP
      };

      return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
    }

    return Promise.resolve(undefined);
  }

  async getApprovalStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (params.selectedQuote) {
      const fromAsset = this.chainService.getAssetBySlug(params.selectedQuote.pair.from);

      if (_isNativeToken(fromAsset)) {
        return Promise.resolve(undefined);
      }

      const chain = this.isTestnet ? 'testnet' : 'mainnet'; // this.chainSetting undefined

      const v2RouterAddress = PIPERX_SWAP_ADDRESSES[chain].v2RouterAddress;
      const piperv3SwapRouterAddress = PIPERX_SWAP_ADDRESSES[chain].piperv3SwapRouterAddress;

      const versionUsed = checkSwapVersion(params.selectedQuote.metadata as string[]);
      const routerContract = versionUsed === 'v2' ? v2RouterAddress : piperv3SwapRouterAddress;

      const evmApi = this.chainService.getEvmApi(fromAsset.originChain);

      const fromContractAddress = _getContractAddressOfToken(fromAsset);
      const fromTokenContract = getERC20Contract(fromContractAddress, evmApi);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const allowance = await fromTokenContract.methods.allowance(params.request.address, routerContract).call() as string;

      if (allowance && new BigNumber(allowance).gt(params.request.fromAmount)) {
        return Promise.resolve(undefined);
      }

      const submitStep = {
        name: 'Approve token',
        type: CommonStepType.TOKEN_APPROVAL
      };

      return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
    }

    return Promise.resolve(undefined);
  }

  public async validateSwapProcess (params: ValidateSwapProcessParams): Promise<TransactionError[]> {
    const amount = params.selectedQuote.fromAmount;
    const bnAmount = BigInt(amount);

    if (bnAmount <= BigInt(0)) {
      return Promise.resolve([new TransactionError(BasicTxErrorType.INVALID_PARAMS, 'Amount must be greater than 0')]);
    }

    let isXcmOk = false;

    for (const [index, step] of params.process.steps.entries()) {
      const getErrors = async (): Promise<TransactionError[]> => {
        switch (step.type) {
          case CommonStepType.DEFAULT:
            return Promise.resolve([]);
          case CommonStepType.TOKEN_APPROVAL:
            return Promise.resolve([]);
          default:
            return this.swapBaseHandler.validateSwapStep(params, isXcmOk, index);
        }
      };

      const errors = await getErrors();

      if (errors.length) {
        return errors;
      } else if (step.type === CommonStepType.XCM) {
        isXcmOk = true;
      }
    }

    return [];
  }

  public async handleSwapProcess (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const { currentStep, process } = params;
    const type = process.steps[currentStep].type;

    switch (type) {
      case CommonStepType.DEFAULT:
        return Promise.reject(new TransactionError(BasicTxErrorType.UNSUPPORTED));
      case CommonStepType.TOKEN_APPROVAL:
        return this.tokenApproveSpending(params);
      case SwapStepType.SWAP:
        return this.handleSubmitStep(params);
      default:
        return this.handleSubmitStep(params);
    }
  }

  private async tokenApproveSpending (params: SwapSubmitParams): Promise<HandleYieldStepData> {
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);
    const fromContract = _getContractAddressOfToken(fromAsset) || PIPERX_SWAP_ADDRESSES[this.chainSetting].WIP_ADDRESS;
    const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
    const versionUsed = checkSwapVersion(params.quote.metadata as string[]);
    const routerContract = versionUsed === 'v2'
      ? PIPERX_SWAP_ADDRESSES[this.chainSetting].v2RouterAddress
      : PIPERX_SWAP_ADDRESSES[this.chainSetting].piperv3SwapRouterAddress;

    const transactionConfig = await routerTokenApproval(fromContract, BigInt(params.quote.fromAmount), params.address, routerContract, evmApi);
    const chain = fromAsset.originChain;

    const _data: TokenSpendingApprovalParams = {
      spenderAddress: routerContract,
      contractAddress: fromContract,
      amount: params.quote.fromAmount,
      owner: params.address,
      chain: chain
    };

    return Promise.resolve({
      txChain: chain,
      extrinsicType: ExtrinsicType.TOKEN_SPENDING_APPROVAL,
      extrinsic: transactionConfig,
      txData: _data,
      transferNativeAmount: '0',
      chainType: ChainType.EVM
    });
  }

  public async handleSubmitStep (params: SwapSubmitParams): Promise<SwapSubmitStepData> {
    const fromAsset = this.chainService.getAssetBySlug(params.quote.pair.from);
    const evmApi = this.chainService.getEvmApi(fromAsset.originChain);

    const txData: SwapBaseTxData = {
      address: params.address,
      provider: this.providerInfo,
      quote: params.quote,
      slippage: params.slippage,
      recipient: params.recipient,
      process: params.process
    };
    const fromAmount = BigInt(params.quote.fromAmount);
    const toAmount = params.quote.toAmount;
    const minReceive = calculateMinReceive(toAmount, params.slippage);

    const extrinsic: TransactionConfig = await swap(fromAmount, minReceive, params.quote.metadata as string[], params.address, BigInt(3000000000), evmApi, this.chainSetting);

    return {
      txChain: fromAsset.originChain,
      txData,
      extrinsic: extrinsic,
      transferNativeAmount: _isNativeToken(fromAsset) ? params.quote.fromAmount : '0',
      extrinsicType: ExtrinsicType.SWAP,
      chainType: ChainType.EVM
    } as SwapSubmitStepData;
  }
}
