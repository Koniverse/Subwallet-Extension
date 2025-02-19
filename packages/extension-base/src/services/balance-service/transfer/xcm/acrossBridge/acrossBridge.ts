// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { createAcrossClient } from '@across-protocol/app-sdk';
import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { getWeb3Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { _getContractAddressOfToken, _getEvmChainId } from '@subwallet/extension-base/services/chain-service/utils';
import { calculateGasFeeParams } from '@subwallet/extension-base/services/fee-service/utils';
import { arbitrum, mainnet, optimism, optimismSepolia, sepolia, soneium } from 'viem/chains';
import { TransactionConfig } from 'web3-core';
import { ContractSendMethod } from 'web3-eth-contract';

import { SpokePoolIV3 } from './abi';
import { SpokePoolMapping } from './constant';

export async function _createAcrossBridgeExtrinsic (tokenInfo: _ChainAsset, destinationTokenInfo: _ChainAsset, originChainInfo: _ChainInfo, destinationChainInfo: _ChainInfo, sender: string, recipientAddress: string, value: string, evmApi: _EvmApi): Promise<TransactionConfig> {
  const client = createAcrossClient({
    integratorId: '0xdead', // 2-byte hex string
    chains: [mainnet, optimism, arbitrum, sepolia, optimismSepolia]
  });

  const originChainId = _getEvmChainId(originChainInfo);
  const destinationChainId = _getEvmChainId(destinationChainInfo);
  const originChainContract = _getContractAddressOfToken(tokenInfo);
  const destinationChainContract = _getContractAddressOfToken(destinationTokenInfo);

  const route = {
    originChainId: originChainId,
    destinationChainId: destinationChainId,
    inputToken: originChainContract as `0x${string}`, // '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' `, // WETH arbitrum
    outputToken: destinationChainContract as `0x${string}` // '0x4200000000000000000000000000000000000006' as `0x${string}` // WETH optimism
  };

  const quote = await client.getQuote({
    route,
    inputAmount: value
  });

  console.log('quote', quote);
  const totalRelayFee = quote.fees.totalRelayFee.total;
  const exclusiveRelayer = quote.deposit.exclusiveRelayer;
  const quoteTimestamp = quote.deposit.quoteTimestamp;

  const fillDeadlineBuffer = 18000;
  const fillDeadline = Math.round(Date.now() / 1000) + fillDeadlineBuffer; // 5 hour

  const exclusivityDeadline = quote.deposit.exclusivityDeadline;
  const message = '0x';

  const SpokePoolAddress = SpokePoolMapping[originChainId].SpokePool.address as string;

  const AcrossBridgeContract = getWeb3Contract(SpokePoolAddress, evmApi, SpokePoolIV3);
  const outputAmount = BigInt(value) - totalRelayFee;

  console.log('AcrossBridgeContract', AcrossBridgeContract);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const transferCall: ContractSendMethod = AcrossBridgeContract.methods.depositV3(
    sender,
    recipientAddress,
    originChainContract, // '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    destinationChainContract, // '0x4200000000000000000000000000000000000006',
    value,
    outputAmount,
    destinationChainId,
    exclusiveRelayer,
    quoteTimestamp,
    fillDeadline,
    exclusivityDeadline,
    message
  );

  console.log('transferCall', transferCall);
  const transferEncodedCall = transferCall.encodeABI();
  const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);

  const transactionConfig: TransactionConfig = {
    from: sender,
    to: SpokePoolAddress,
    value: value,
    data: transferEncodedCall,
    gasPrice: priority.gasPrice,
    maxFeePerGas: priority?.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: priority?.maxPriorityFeePerGas?.toString()
  };
  const gasLimit = await evmApi.api.eth.estimateGas(transactionConfig).catch(() => 200000);

  transactionConfig.gas = gasLimit.toString();

  return transactionConfig;
}

export function _isAcrossChainBridge (srcChain: string, destChain: string): boolean {
  if (srcChain === 'soneium' && destChain === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA) {
    return true;
  } else if (srcChain === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA && destChain === 'soneium') {
    return true;
  }

  return false;
}
