// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { ChainType, EvmSignatureRequest, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { validateTypedSignMessageDataV3V4 } from '@subwallet/extension-base/core/logic-validation';
import { BaseStepDetail, BasicTxErrorType, CommonOptimalPath, CommonStepFeeInfo, CommonStepType, FeeOptionKey, HandleYieldStepData, OptimalSwapPathParams, SwapBaseTxData, SwapProviderId, SwapStepType, SwapSubmitParams, SwapSubmitStepData, TokenSpendingApprovalParams, ValidateSwapProcessParams } from '@subwallet/extension-base/types';
import { getId } from '@subwallet/extension-base/utils/getId';
import keyring from '@subwallet/ui-keyring';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';

import { BalanceService } from '../../balance-service';
import { ChainService } from '../../chain-service';
import { _isNativeToken } from '../../chain-service/utils';
import FeeService from '../../fee-service/service';
import { calculateGasFeeParams } from '../../fee-service/utils';
import RequestService from '../../request-service';
import { EXTENSION_REQUEST_URL } from '../../request-service/constants';
import { SwapBaseHandler, SwapBaseInterface } from './base-handler';

const API_URL = 'https://trade-api.gateway.uniswap.org/v1';
const headers = {
  'x-api-key': process.env.UNISWAP_API_KEY || ''
};

export type PermitData = {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  values: unknown;
};

interface UniswapMetadata {
  permitData: PermitData;
  quote: UniswapQuote;
  routing: string;
}

interface UniswapQuote {
  chainId: number;
  input: {
    amount: string;
    token: string;
  };
  output: {
    amount: string;
    token: string;
  };
}
interface SwapResponse {
  swap: TransactionConfig
}

interface CheckApprovalResponse {
  requestId: string;
  approval: any;
  cancel: any;
}

async function fetchCheckApproval (walletAddress: string, fromAmount: string, quote: UniswapQuote): Promise<CheckApprovalResponse> {
  const chainId = quote.chainId;
  const response = await fetch(`${API_URL}/check_approval`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      walletAddress,
      amount: BigNumber(fromAmount).multipliedBy(2).toString(),
      token: quote.input.token,
      chainId: chainId,
      tokenOut: quote.output.token,
      tokenOutChainId: chainId
    })
  });

  const data = await response.json() as CheckApprovalResponse;

  return data;
}

export class UniswapHandler implements SwapBaseInterface {
  private swapBaseHandler: SwapBaseHandler;
  public requestService: RequestService;

  providerSlug: SwapProviderId;
  constructor (chainService: ChainService, balanceService: BalanceService, requestSerive: RequestService, feeService: FeeService) {
    this.swapBaseHandler = new SwapBaseHandler({
      chainService,
      balanceService,
      feeService,
      providerName: 'Uniswap',
      providerSlug: SwapProviderId.UNISWAP
    });

    this.requestService = requestSerive;
    this.providerSlug = SwapProviderId.UNISWAP;
  }

  get chainService () {
    return this.swapBaseHandler.chainService;
  }

  get balanceService () {
    return this.swapBaseHandler.balanceService;
  }

  get feeService () {
    return this.swapBaseHandler.feeService;
  }

  get providerInfo () {
    return this.swapBaseHandler.providerInfo;
  }

  generateOptimalProcess (params: OptimalSwapPathParams): Promise<CommonOptimalPath> {
    return this.swapBaseHandler.generateOptimalProcess(params, [
      this.getApprovalStep,
      this.getSubmitStep
    ]);
  }

  async getApprovalStep (params: OptimalSwapPathParams): Promise<[BaseStepDetail, CommonStepFeeInfo] | undefined> {
    if (params.selectedQuote) {
      const walletAddress = params.request.address;
      const fromAmount = params.selectedQuote.fromAmount;
      const { quote } = params.selectedQuote.metadata as UniswapMetadata;

      const checkApprovalResponse = await fetchCheckApproval(walletAddress, fromAmount, quote);

      if (checkApprovalResponse.approval) {
        const submitStep = {
          name: 'Approve token',
          type: CommonStepType.TOKEN_APPROVAL
        };

        return Promise.resolve([submitStep, params.selectedQuote.feeInfo]);
      }
    }

    return Promise.resolve(undefined);
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
    const walletAddress = params.address;
    const fromAmount = params.quote.fromAmount;
    const { quote } = params.quote.metadata as UniswapMetadata;

    const checkApprovalResponse = await fetchCheckApproval(walletAddress, fromAmount, quote);
    let transactionConfig: TransactionConfig = {} as TransactionConfig;

    const approval = checkApprovalResponse.approval as TransactionConfig;

    if (approval) {
      const evmApi = this.chainService.getEvmApi(fromAsset.originChain);
      const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);

      transactionConfig = {
        from: approval.from,
        to: approval.to,
        value: approval.value,
        data: approval.data,
        gasPrice: priority.gasPrice,
        maxFeePerGas: priority.options?.[FeeOptionKey.AVERAGE].maxFeePerGas?.toString(),
        maxPriorityFeePerGas: priority.options?.[FeeOptionKey.AVERAGE].maxPriorityFeePerGas.toString()
      };
      const gasLimit = await evmApi.api.eth.estimateGas(transactionConfig).catch(() => 200000);

      transactionConfig.gas = gasLimit.toString();
    }

    const chain = fromAsset.originChain;

    const _data: TokenSpendingApprovalParams = {
      spenderAddress: quote.output.token,
      contractAddress: quote.input.token,
      amount: params.quote.fromAmount,
      owner: params.address,
      chain: quote.chainId.toString()
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

    const { permitData, quote, routing } = params.quote.metadata as UniswapMetadata;

    let signature;

    if (permitData) {
      const id = getId();
      const payload = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ],
          ...permitData.types
        },
        domain: permitData.domain,
        primaryType: 'PermitSingle',
        message: permitData.values
      };

      const validatePayload = validateTypedSignMessageDataV3V4({ data: payload, from: params.address });

      const pair = keyring.getPair(params.address);
      const canSign = !pair.meta.isExternal;

      const evmSignaturePayload: EvmSignatureRequest = {
        id: id,
        type: 'eth_signTypedData_v4',
        payload: validatePayload,
        address: params.address,
        hashPayload: '',
        canSign: canSign
      };

      signature = await this.requestService.addConfirmation(id, EXTENSION_REQUEST_URL, 'evmSignatureRequest', evmSignaturePayload, {});
    }

    let postTransactionResponse;
    let extrinsic;

    if (routing === 'CLASSIC' || routing === 'WRAP' || routing === 'UNWRAP') {
      const body: Record<string, any> = {
        signature: signature?.payload,
        quote: quote
      };

      if (permitData) {
        body.permitData = permitData;
      }

      postTransactionResponse = await fetch(`${API_URL}/swap`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const transactionResponse = await postTransactionResponse.json() as SwapResponse;

      extrinsic = transactionResponse.swap;
    } else if (routing === 'DUTCH_LIMIT' || routing === 'DUTCH_V2') {
      postTransactionResponse = await fetch(`${API_URL}/order`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature: signature,
          quote: quote
        })
      });
    }

    const txData: SwapBaseTxData = {
      address: params.address,
      provider: this.providerInfo,
      quote: params.quote,
      slippage: params.slippage,
      recipient: params.recipient,
      process: params.process
    };

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
