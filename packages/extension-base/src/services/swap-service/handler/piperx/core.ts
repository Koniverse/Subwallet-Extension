// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { getWeb3Contract } from '@subwallet/extension-base/koni/api/contract-handler/evm/web3';
import { EvmApi } from '@subwallet/extension-base/services/chain-service/handler/EvmApi';
import { calculateGasFeeParams } from '@subwallet/extension-base/services/fee-service/utils';
import { TransactionConfig } from 'web3-core';

import { fee2TickSpace, PIPERX_SWAP_ADDRESSES } from './constant';
import { abi, multicallAbi, piperv3QuoterAbi, piperv3SwapRouterAbi, v2RouterAbi } from './piperx_abi';

export const routingExactInput = async (
  tokenIn: string,
  tokenOut: string,
  tokenInAmount: bigint,
  signerAddress: string,
  evmApi: EvmApi,
  chain: 'testnet' | 'mainnet'
): Promise<{ bestRoute: string[]; maxAmountOut: bigint }> => {
  const { bestRoute: bestRouteV2, maxAmountOut: maxAmountOutV2 } = await v2RoutingExactInput(tokenIn, tokenOut, tokenInAmount, evmApi, chain);
  const { bestRoute: bestRouteV3, maxAmountOut: maxAmountOutV3 } = await v3RoutingExactInput(tokenIn, tokenOut, tokenInAmount, signerAddress, evmApi, chain);

  return maxAmountOutV2 > maxAmountOutV3
    ? { bestRoute: bestRouteV2, maxAmountOut: maxAmountOutV2 }
    : { bestRoute: bestRouteV3, maxAmountOut: maxAmountOutV3 };
};

export const swap = async (
  amount1: bigint,
  amount2Min: bigint,
  path: string[],
  address: string,
  expirationTimestamp: bigint,
  evmApi: EvmApi,
  chain: 'testnet' | 'mainnet'
) => {
  if (path[1].length < 10) { // v3 swap
    return await v3Swap(amount1, amount2Min, path, address, expirationTimestamp, evmApi, chain);
  } else { // v2 swap
    return await v2Swap(amount1, amount2Min, path, address, expirationTimestamp, evmApi, chain);
  }
};

export const checkSwapVersion = (
  path: string[]
): 'v2' | 'v3' => {
  if (path[1].length < 10) { // v3 swap
    return 'v3';
  } else { // v2 swap
    return 'v2';
  }
};

// interface Reserves {
//   _reserve0: string;
//   _reserve1: string;
//   _blockTimestampLast: string;
// }

// type Slot0 = {
//   sqrtPriceX96: string;
// };

interface MulticallResult {
  success: boolean;
  returnData: string;
}

type MulticallResponse = MulticallResult[];

// export const v2GetPrice = async (
//   token1: string,
//   token2: string,
//   evmApi: EvmApi
// ) => {
//   const pairAddress = v2ComputeAddress(token1, token2);
//   const pairContract = getWeb3Contract(pairAddress, evmApi, v2PoolAbi);
//
//   try {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
//     const reserve = (await pairContract.methods.getReserves().call()) as Reserves;
//
//     // Determine token order (tokens are stored in ascending order by address in Uniswap V2)
//     const token1_ = token1.toLowerCase() < token2.toLowerCase() ? token1 : token2;
//
//     const reserve0 = reserve._reserve0;
//     const reserve1 = reserve._reserve1;
//
//     // Calculate price based on reserves
//     return token1_ === token1
//       // @ts-ignore
//       ? reserve1 / reserve0
//       // @ts-ignore
//       : reserve0 / reserve1;
//   } catch (error) {
//     console.error('Error fetching reserves:', error);
//     throw error;
//   }
// };

export const v2RoutingExactInput = async (
  tokenIn: string,
  tokenOut: string,
  tokenInAmount: bigint,
  evmApi: EvmApi,
  chain: 'testnet' | 'mainnet'
): Promise<{ bestRoute: string[]; maxAmountOut: bigint }> => {
  let bestRoute: string[] = [];
  let maxAmountOut = BigInt(0);

  try {
    const v2RouterAddress = PIPERX_SWAP_ADDRESSES[chain].v2RouterAddress;
    const defaultTokens = PIPERX_SWAP_ADDRESSES[chain].defaultTokens;
    const multicallAddress = PIPERX_SWAP_ADDRESSES[chain].multicallAddress;

    const v2RouterContract = getWeb3Contract(v2RouterAddress, evmApi, v2RouterAbi);

    // Direct route calculation
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const directResult = await v2RouterContract.methods
        .getAmountsOut(tokenInAmount.toString(), [tokenIn, tokenOut])
        .call() as number[];

      if (directResult && directResult.length > 1) {
        maxAmountOut = BigInt(directResult[1]);
        bestRoute = [tokenIn, tokenOut];
      }
    } catch (error) {
      console.debug('Error in direct route calculation:', error);
    }

    // Multicall for intermediate tokens
    const calls: Record<string, string>[] = [];
    const intermediateTokens = defaultTokens.filter(
      (intermediateToken) => intermediateToken !== tokenIn && intermediateToken !== tokenOut
    );

    for (const intermediateToken of intermediateTokens) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const callData = v2RouterContract.methods
        .getAmountsOut(tokenInAmount.toString(), [tokenIn, intermediateToken, tokenOut])
        .encodeABI() as string;

      calls.push({ target: v2RouterAddress, callData });
    }

    try {
      const multicallContract = getWeb3Contract(multicallAddress, evmApi, multicallAbi);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const aggregateResult = await multicallContract.methods
        .tryAggregate(false, calls)
        .call() as [boolean, string][];

      for (let i = 0; i < aggregateResult.length; i++) {
        const [success, returnData] = aggregateResult[i];

        if (success) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
            const result: {[key: string]: string} = evmApi.api.eth.abi.decodeParameters(['uint256[]'], returnData);

            const amountOut = BigInt(result[0][result[0].length - 1]);

            if (amountOut > maxAmountOut) {
              maxAmountOut = amountOut;
              bestRoute = [tokenIn, intermediateTokens[i], tokenOut];
            }
          } catch (error) {
            console.debug(`Error decoding result for ${intermediateTokens[i]}:`, error);
          }
        }
      }
    } catch (error) {
      console.debug('Multicall tryAggregate failed:', error);
    }
  } catch (error) {
    console.error('Error in v2RoutingExactInput:', error);
  }

  return { bestRoute, maxAmountOut };
};

export const v2Swap = async (
  amount1: bigint,
  amount2Min: bigint,
  path: string[],
  address: string,
  expirationTimestamp: bigint,
  evmApi: EvmApi,
  chain: 'testnet' | 'mainnet'
) => {
  const WIP_ADDRESS = PIPERX_SWAP_ADDRESSES[chain].WIP_ADDRESS;
  const v2RouterAddress = PIPERX_SWAP_ADDRESSES[chain].v2RouterAddress;

  try {
    const router = getWeb3Contract(v2RouterAddress, evmApi, v2RouterAbi);
    let call;

    if (path[0] === WIP_ADDRESS) {
      // ETH -> Tokens swap
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      call = router.methods.swapExactETHForTokens(
        amount2Min.toString(),
        path,
        address,
        expirationTimestamp.toString()
      );
    } else if (path[path.length - 1] === WIP_ADDRESS) {
      // Token -> ETH swap
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      call = router.methods.swapExactTokensForETH(
        amount1.toString(),
        amount2Min.toString(),
        path,
        address,
        expirationTimestamp.toString()
      );
    } else {
      // Token -> Token swap
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      call = router.methods.swapExactTokensForTokens(
        amount1.toString(),
        amount2Min.toString(),
        path,
        address,
        expirationTimestamp.toString()
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const encodedCall = call.encodeABI() as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const gasLimit = await call.estimateGas({ from: address, value: path[0] === WIP_ADDRESS ? amount1.toString() : '0' }) as number;

    const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);

    const txConfig: TransactionConfig = {
      from: address,
      to: v2RouterAddress.toLowerCase(),
      value: path[0] === WIP_ADDRESS ? amount1.toString() : '0',
      data: encodedCall,
      gas: (gasLimit * 1.2).toFixed(0),
      maxFeePerGas: priority.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: priority.maxPriorityFeePerGas?.toString()
    };

    return txConfig;
  } catch (error) {
    console.error('Error in swap:', error);
    throw error;
  }
};

export const routerTokenApproval = async (
  token: string,
  amount: bigint,
  address: string,
  spender: string,
  evmApi: EvmApi
) => {
  try {
    const tokenContract = getWeb3Contract(token, evmApi, abi);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const call = tokenContract.methods.approve(spender, amount.toString());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const gasLimit = await call.estimateGas({ from: address });

    const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const encodedCall = call.encodeABI() as string;

    const txConfig: TransactionConfig = {
      from: address,
      to: token.toLowerCase(),
      data: encodedCall,
      gas: (gasLimit * 1.5).toFixed(0),
      maxFeePerGas: priority.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: priority.maxPriorityFeePerGas?.toString()
    };

    return txConfig;
  } catch (error) {
    console.error('Error in v2RouterTokenApproval:', error);
    throw error;
  }
};

// export const v3GetPrice = async (
//   token1: string,
//   token2: string,
//   evmApi: EvmApi,
//   fee = 3000 // Default to 0.3% fee tier
// ): Promise<number> => {
//   // Compute pool address using V3 factory
//   const factory = getWeb3Contract(piperv3FactoryAddress, evmApi, piperv3FactoryAbi);
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
//   const poolAddress = await factory.methods.getPool(token1, token2, fee).call();
//
//   if (poolAddress === '0x0000000000000000000000000000000000000000') {
//     throw new Error('Pool does not exist');
//   }
//
//   const poolContract = getWeb3Contract(poolAddress as string, evmApi, piperv3PoolAbi);
//
//   try {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
//     const slot0: Slot0 = await poolContract.methods.slot0().call();
//
//     const sqrtPriceX96 = slot0.sqrtPriceX96;
//
//     // Convert sqrtPriceX96 to regular price
//     const price = (Number(sqrtPriceX96) / 2 ** 96) ** 2;
//
//     // Determine if price needs to be inverted based on token order
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
//     const token0: string = await poolContract.methods.token0().call();
//
//     return token0.toLowerCase() === token1.toLowerCase() ? price : 1 / price;
//   } catch (error) {
//     console.error('Error fetching V3 price:', error);
//     throw error;
//   }
// };

export const v3RoutingExactInput = async (
  tokenIn: string,
  tokenOut: string,
  tokenInAmount: bigint,
  signerAddress: string,
  evmApi: EvmApi,
  chain: 'testnet' | 'mainnet'
): Promise<{ bestRoute: string[]; maxAmountOut: bigint }> => {
  const piperv3QuoterAddress = PIPERX_SWAP_ADDRESSES[chain].piperv3QuoterAddress;
  const multicallAddress = PIPERX_SWAP_ADDRESSES[chain].multicallAddress;

  const quoterContract = getWeb3Contract(piperv3QuoterAddress, evmApi, piperv3QuoterAbi);
  let bestRoute: string[] = [];
  let maxAmountOut = BigInt(0);

  const calls = Object.keys(fee2TickSpace).map((feeTier) => ({
    target: piperv3QuoterAddress,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    callData: quoterContract.methods
      .quoteExactInputSingle({
        tokenIn,
        tokenOut,
        fee: feeTier,
        amountIn: tokenInAmount.toString(),
        sqrtPriceLimitX96: '0'
      })
      .encodeABI()
  }));

  try {
    const multicallContract = getWeb3Contract(multicallAddress, evmApi, multicallAbi);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const aggregateResult: MulticallResponse = await multicallContract.methods.tryAggregate(false, calls).call({
      from: signerAddress,
      gas: calls.length * 300000
    });

    aggregateResult.forEach(({ returnData, success }, i) => {
      if (success) {
        try {
          const decoded: { [key: string]: string } = evmApi.api.eth.abi.decodeParameters(['uint256', 'uint256'], returnData);
          const amountOut = BigInt(decoded[0]);

          if (amountOut > maxAmountOut) {
            maxAmountOut = amountOut;
            bestRoute = [tokenIn, Object.keys(fee2TickSpace)[i], tokenOut];
          }
        } catch (error) {
          console.log(`Error decoding result for fee tier ${Object.keys(fee2TickSpace)[i]}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('Multicall tryAggregate failed:', error);
  }

  return { bestRoute, maxAmountOut };
};

export const v3Swap = async (
  amount1: bigint,
  amount2Min: bigint,
  path: string[],
  address: string,
  expirationTimestamp: bigint,
  evmApi: EvmApi,
  chain: 'testnet' | 'mainnet'
) => {
  if (path.length !== 3) {
    throw new Error('path must contain 3 elements');
  }

  const piperv3SwapRouterAddress = PIPERX_SWAP_ADDRESSES[chain].piperv3SwapRouterAddress;
  const WIP_ADDRESS = PIPERX_SWAP_ADDRESSES[chain].WIP_ADDRESS;

  try {
    const router = getWeb3Contract(piperv3SwapRouterAddress, evmApi, piperv3SwapRouterAbi);
    let call;

    const exactInputSingleParams = {
      tokenIn: path[0],
      tokenOut: path[2],
      fee: path[1],
      recipient: address,
      deadline: expirationTimestamp,
      amountIn: amount1.toString(),
      amountOutMinimum: '1',
      sqrtPriceLimitX96: '0'
    };

    if (path[0] === WIP_ADDRESS) {
      // IP -> Token (Native IP to ERC-20)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      call = router.methods.exactInputSingle(exactInputSingleParams);
    } else if (path[2] === WIP_ADDRESS) {
      // Token -> IP (ERC-20 to Native IP)
      const multicallData = [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        router.methods.exactInputSingle(exactInputSingleParams).encodeABI(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        router.methods.unwrapWETH9(amount2Min.toString(), address).encodeABI()
      ];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      call = router.methods.multicall(multicallData);
    } else {
      // Token -> Token
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      call = router.methods.exactInputSingle(exactInputSingleParams);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const encodedCall = call.encodeABI() as string;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const gasLimit = await call.estimateGas({ from: address, value: path[0] === WIP_ADDRESS ? amount1.toString() : '0' }) as number;
    const priority = await calculateGasFeeParams(evmApi, evmApi.chainSlug);

    const txConfig: TransactionConfig = {
      from: address,
      to: piperv3SwapRouterAddress.toLowerCase(),
      value: path[0] === WIP_ADDRESS ? amount1.toString() : '0',
      data: encodedCall,
      gas: (gasLimit * 1.2).toFixed(0),
      maxFeePerGas: priority.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: priority.maxPriorityFeePerGas?.toString()
    };

    return txConfig;
  } catch (error) {
    console.error('Error in v3 swap:', error);
    throw error;
  }
};
