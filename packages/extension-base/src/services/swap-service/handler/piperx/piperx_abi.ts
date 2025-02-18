// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { AbiItem } from 'web3-utils';

export const erc20Abi1 = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'supply', type: 'uint256' }]
  }
] as const;

export const abi: AbiItem[] = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{
      type: 'bool',
      name: ''
    }]
  },
  {
    type: 'function',
    name: 'transferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{
      type: 'bool',
      name: ''
    }]
  }
];

export const faucetAbi = [{ constant: false, inputs: [], name: 'drip', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }] as const;

export const erc20Abi2 = [{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'owner', type: 'address' }, { indexed: true, internalType: 'address', name: 'spender', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'Approval', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'from', type: 'address' }, { indexed: true, internalType: 'address', name: 'to', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }, { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' }], name: 'Transfer', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'from', type: 'address' }, { indexed: true, internalType: 'address', name: 'to', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'Transfer', type: 'event' }, { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }, { inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }, { inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' }, { inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' }], name: 'decreaseAllowance', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' }], name: 'decreaseApproval', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'addedValue', type: 'uint256' }], name: 'increaseAllowance', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'addedValue', type: 'uint256' }], name: 'increaseApproval', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' }, { inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' }, { inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }, { inputs: [{ internalType: 'address', name: 'recipient', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'transfer', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'bytes', name: 'data', type: 'bytes' }], name: 'transferAndCall', outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'sender', type: 'address' }, { internalType: 'address', name: 'recipient', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'transferFrom', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [], name: 'typeAndVersion', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'pure', type: 'function' }] as const;

export const v2PoolAbi: AbiItem[] = [{ inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'owner', type: 'address' }, { indexed: true, internalType: 'address', name: 'spender', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'Approval', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'sender', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount0', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'amount1', type: 'uint256' }, { indexed: true, internalType: 'address', name: 'to', type: 'address' }], name: 'Burn', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'sender', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount0', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'amount1', type: 'uint256' }], name: 'Mint', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'sender', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount0In', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'amount1In', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'amount0Out', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'amount1Out', type: 'uint256' }, { indexed: true, internalType: 'address', name: 'to', type: 'address' }], name: 'Swap', type: 'event' }, { anonymous: false, inputs: [{ indexed: false, internalType: 'uint112', name: 'reserve0', type: 'uint112' }, { indexed: false, internalType: 'uint112', name: 'reserve1', type: 'uint112' }], name: 'Sync', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'from', type: 'address' }, { indexed: true, internalType: 'address', name: 'to', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'Transfer', type: 'event' }, { constant: true, inputs: [], name: 'DOMAIN_SEPARATOR', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'MINIMUM_LIQUIDITY', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'PERMIT_TYPEHASH', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [{ internalType: 'address', name: '', type: 'address' }, { internalType: 'address', name: '', type: 'address' }], name: 'allowance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'burn', outputs: [{ internalType: 'uint256', name: 'amount0', type: 'uint256' }, { internalType: 'uint256', name: 'amount1', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'factory', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'getReserves', outputs: [{ internalType: 'uint112', name: '_reserve0', type: 'uint112' }, { internalType: 'uint112', name: '_reserve1', type: 'uint112' }, { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: '_token0', type: 'address' }, { internalType: 'address', name: '_token1', type: 'address' }], name: 'initialize', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'kLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'mint', outputs: [{ internalType: 'uint256', name: 'liquidity', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'nonces', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }, { internalType: 'uint8', name: 'v', type: 'uint8' }, { internalType: 'bytes32', name: 'r', type: 'bytes32' }, { internalType: 'bytes32', name: 's', type: 'bytes32' }], name: 'permit', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'price0CumulativeLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'price1CumulativeLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'skim', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: false, inputs: [{ internalType: 'uint256', name: 'amount0Out', type: 'uint256' }, { internalType: 'uint256', name: 'amount1Out', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }], name: 'swap', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [], name: 'sync', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'token0', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'token1', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'transfer', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: 'from', type: 'address' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'transferFrom', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }];

export const v2FactoryAbi = [{ inputs: [{ internalType: 'address', name: '_feeToSetter', type: 'address' }], payable: false, stateMutability: 'nonpayable', type: 'constructor' }, { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'token0', type: 'address' }, { indexed: true, internalType: 'address', name: 'token1', type: 'address' }, { indexed: false, internalType: 'address', name: 'pair', type: 'address' }, { indexed: false, internalType: 'uint256', name: '', type: 'uint256' }], name: 'PairCreated', type: 'event' }, { constant: true, inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], name: 'allPairs', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'allPairsLength', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: 'tokenA', type: 'address' }, { internalType: 'address', name: 'tokenB', type: 'address' }], name: 'createPair', outputs: [{ internalType: 'address', name: 'pair', type: 'address' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'feeTo', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'feeToSetter', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [{ internalType: 'address', name: '', type: 'address' }, { internalType: 'address', name: '', type: 'address' }], name: 'getPair', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: '_feeTo', type: 'address' }], name: 'setFeeTo', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: false, inputs: [{ internalType: 'address', name: '_feeToSetter', type: 'address' }], name: 'setFeeToSetter', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }] as const;

export const v2RouterAbi: AbiItem[] = [{ inputs: [{ internalType: 'address', name: '_factory', type: 'address' }, { internalType: 'address', name: '_WETH', type: 'address' }], stateMutability: 'nonpayable', type: 'constructor' }, { inputs: [], name: 'WETH', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' }, { inputs: [{ internalType: 'address', name: 'tokenA', type: 'address' }, { internalType: 'address', name: 'tokenB', type: 'address' }, { internalType: 'uint256', name: 'amountADesired', type: 'uint256' }, { internalType: 'uint256', name: 'amountBDesired', type: 'uint256' }, { internalType: 'uint256', name: 'amountAMin', type: 'uint256' }, { internalType: 'uint256', name: 'amountBMin', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'addLiquidity', outputs: [{ internalType: 'uint256', name: 'amountA', type: 'uint256' }, { internalType: 'uint256', name: 'amountB', type: 'uint256' }, { internalType: 'uint256', name: 'liquidity', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'uint256', name: 'amountTokenDesired', type: 'uint256' }, { internalType: 'uint256', name: 'amountTokenMin', type: 'uint256' }, { internalType: 'uint256', name: 'amountETHMin', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'addLiquidityETH', outputs: [{ internalType: 'uint256', name: 'amountToken', type: 'uint256' }, { internalType: 'uint256', name: 'amountETH', type: 'uint256' }, { internalType: 'uint256', name: 'liquidity', type: 'uint256' }], stateMutability: 'payable', type: 'function' }, { inputs: [], name: 'factory', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }, { internalType: 'uint256', name: 'reserveIn', type: 'uint256' }, { internalType: 'uint256', name: 'reserveOut', type: 'uint256' }], name: 'getAmountIn', outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }], stateMutability: 'pure', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }, { internalType: 'uint256', name: 'reserveIn', type: 'uint256' }, { internalType: 'uint256', name: 'reserveOut', type: 'uint256' }], name: 'getAmountOut', outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }], stateMutability: 'pure', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }], name: 'getAmountsIn', outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], stateMutability: 'view', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }], name: 'getAmountsOut', outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], stateMutability: 'view', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountA', type: 'uint256' }, { internalType: 'uint256', name: 'reserveA', type: 'uint256' }, { internalType: 'uint256', name: 'reserveB', type: 'uint256' }], name: 'quote', outputs: [{ internalType: 'uint256', name: 'amountB', type: 'uint256' }], stateMutability: 'pure', type: 'function' }, { inputs: [{ internalType: 'address', name: 'tokenA', type: 'address' }, { internalType: 'address', name: 'tokenB', type: 'address' }, { internalType: 'uint256', name: 'liquidity', type: 'uint256' }, { internalType: 'uint256', name: 'amountAMin', type: 'uint256' }, { internalType: 'uint256', name: 'amountBMin', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'removeLiquidity', outputs: [{ internalType: 'uint256', name: 'amountA', type: 'uint256' }, { internalType: 'uint256', name: 'amountB', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'uint256', name: 'liquidity', type: 'uint256' }, { internalType: 'uint256', name: 'amountTokenMin', type: 'uint256' }, { internalType: 'uint256', name: 'amountETHMin', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'removeLiquidityETH', outputs: [{ internalType: 'uint256', name: 'amountToken', type: 'uint256' }, { internalType: 'uint256', name: 'amountETH', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'uint256', name: 'liquidity', type: 'uint256' }, { internalType: 'uint256', name: 'amountTokenMin', type: 'uint256' }, { internalType: 'uint256', name: 'amountETHMin', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'removeLiquidityETHSupportingFeeOnTransferTokens', outputs: [{ internalType: 'uint256', name: 'amountETH', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'uint256', name: 'liquidity', type: 'uint256' }, { internalType: 'uint256', name: 'amountTokenMin', type: 'uint256' }, { internalType: 'uint256', name: 'amountETHMin', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }, { internalType: 'bool', name: 'approveMax', type: 'bool' }, { internalType: 'uint8', name: 'v', type: 'uint8' }, { internalType: 'bytes32', name: 'r', type: 'bytes32' }, { internalType: 'bytes32', name: 's', type: 'bytes32' }], name: 'removeLiquidityETHWithPermit', outputs: [{ internalType: 'uint256', name: 'amountToken', type: 'uint256' }, { internalType: 'uint256', name: 'amountETH', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'uint256', name: 'liquidity', type: 'uint256' }, { internalType: 'uint256', name: 'amountTokenMin', type: 'uint256' }, { internalType: 'uint256', name: 'amountETHMin', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }, { internalType: 'bool', name: 'approveMax', type: 'bool' }, { internalType: 'uint8', name: 'v', type: 'uint8' }, { internalType: 'bytes32', name: 'r', type: 'bytes32' }, { internalType: 'bytes32', name: 's', type: 'bytes32' }], name: 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens', outputs: [{ internalType: 'uint256', name: 'amountETH', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'address', name: 'tokenA', type: 'address' }, { internalType: 'address', name: 'tokenB', type: 'address' }, { internalType: 'uint256', name: 'liquidity', type: 'uint256' }, { internalType: 'uint256', name: 'amountAMin', type: 'uint256' }, { internalType: 'uint256', name: 'amountBMin', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }, { internalType: 'bool', name: 'approveMax', type: 'bool' }, { internalType: 'uint8', name: 'v', type: 'uint8' }, { internalType: 'bytes32', name: 'r', type: 'bytes32' }, { internalType: 'bytes32', name: 's', type: 'bytes32' }], name: 'removeLiquidityWithPermit', outputs: [{ internalType: 'uint256', name: 'amountA', type: 'uint256' }, { internalType: 'uint256', name: 'amountB', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapETHForExactTokens', outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], stateMutability: 'payable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapExactETHForTokens', outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], stateMutability: 'payable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapExactETHForTokensSupportingFeeOnTransferTokens', outputs: [], stateMutability: 'payable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }, { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapExactTokensForETH', outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }, { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapExactTokensForETHSupportingFeeOnTransferTokens', outputs: [], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }, { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapExactTokensForTokens', outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }, { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens', outputs: [], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }, { internalType: 'uint256', name: 'amountInMax', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapTokensForExactETH', outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function' }, { inputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }, { internalType: 'uint256', name: 'amountInMax', type: 'uint256' }, { internalType: 'address[]', name: 'path', type: 'address[]' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }], name: 'swapTokensForExactTokens', outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], stateMutability: 'nonpayable', type: 'function' }, { stateMutability: 'payable', type: 'receive' }] as const;

export const piperv3QuoterAbi = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'path',
        type: 'bytes'
      },
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      }
    ],
    name: 'quoteExactInput',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'uint160[]',
        name: 'sqrtPriceX96AfterList',
        type: 'uint160[]'
      },
      {
        internalType: 'uint32[]',
        name: 'initializedTicksCrossedList',
        type: 'uint32[]'
      },
      {
        internalType: 'uint256',
        name: 'gasEstimate',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenIn',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'tokenOut',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256'
          },
          {
            internalType: 'uint24',
            name: 'fee',
            type: 'uint24'
          },
          {
            internalType: 'uint160',
            name: 'sqrtPriceLimitX96',
            type: 'uint160'
          }
        ],
        internalType: 'struct IQuoterV2.QuoteExactInputSingleParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'uint160',
        name: 'sqrtPriceX96After',
        type: 'uint160'
      },
      {
        internalType: 'uint32',
        name: 'initializedTicksCrossed',
        type: 'uint32'
      },
      {
        internalType: 'uint256',
        name: 'gasEstimate',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'path',
        type: 'bytes'
      },
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      }
    ],
    name: 'quoteExactOutput',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'uint160[]',
        name: 'sqrtPriceX96AfterList',
        type: 'uint160[]'
      },
      {
        internalType: 'uint32[]',
        name: 'initializedTicksCrossedList',
        type: 'uint32[]'
      },
      {
        internalType: 'uint256',
        name: 'gasEstimate',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenIn',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'tokenOut',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256'
          },
          {
            internalType: 'uint24',
            name: 'fee',
            type: 'uint24'
          },
          {
            internalType: 'uint160',
            name: 'sqrtPriceLimitX96',
            type: 'uint160'
          }
        ],
        internalType: 'struct IQuoterV2.QuoteExactOutputSingleParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'quoteExactOutputSingle',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'uint160',
        name: 'sqrtPriceX96After',
        type: 'uint160'
      },
      {
        internalType: 'uint32',
        name: 'initializedTicksCrossed',
        type: 'uint32'
      },
      {
        internalType: 'uint256',
        name: 'gasEstimate',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_factory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_WETH9',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'amount0Delta',
        type: 'int256'
      },
      {
        internalType: 'int256',
        name: 'amount1Delta',
        type: 'int256'
      },
      {
        internalType: 'bytes',
        name: 'path',
        type: 'bytes'
      }
    ],
    name: 'uniswapV3SwapCallback',
    outputs: [],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'WETH9',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

export const multicallAbi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'aggregate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256'
      },
      {
        internalType: 'bytes[]',
        name: 'returnData',
        type: 'bytes[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address'
          },
          {
            internalType: 'bool',
            name: 'allowFailure',
            type: 'bool'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Call3[]',
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'success',
            type: 'bool'
          },
          {
            internalType: 'bytes',
            name: 'returnData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address'
          },
          {
            internalType: 'bool',
            name: 'allowFailure',
            type: 'bool'
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Call3Value[]',
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'aggregate3Value',
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'success',
            type: 'bool'
          },
          {
            internalType: 'bytes',
            name: 'returnData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'blockAndAggregate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256'
      },
      {
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32'
      },
      {
        components: [
          {
            internalType: 'bool',
            name: 'success',
            type: 'bool'
          },
          {
            internalType: 'bytes',
            name: 'returnData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getBasefee',
    outputs: [
      {
        internalType: 'uint256',
        name: 'basefee',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256'
      }
    ],
    name: 'getBlockHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getBlockNumber',
    outputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getChainId',
    outputs: [
      {
        internalType: 'uint256',
        name: 'chainid',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentBlockCoinbase',
    outputs: [
      {
        internalType: 'address',
        name: 'coinbase',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentBlockDifficulty',
    outputs: [
      {
        internalType: 'uint256',
        name: 'difficulty',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentBlockGasLimit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'gaslimit',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentBlockTimestamp',
    outputs: [
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address'
      }
    ],
    name: 'getEthBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getLastBlockHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'requireSuccess',
        type: 'bool'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'tryAggregate',
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'success',
            type: 'bool'
          },
          {
            internalType: 'bytes',
            name: 'returnData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'requireSuccess',
        type: 'bool'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'tryBlockAndAggregate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256'
      },
      {
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32'
      },
      {
        components: [
          {
            internalType: 'bool',
            name: 'success',
            type: 'bool'
          },
          {
            internalType: 'bytes',
            name: 'returnData',
            type: 'bytes'
          }
        ],
        internalType: 'struct Multicall3.Result[]',
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  }
];

export const piperv3FactoryAbi: AbiItem[] = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24'
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickSpacing',
        type: 'int24'
      }
    ],
    name: 'FeeAmountEnabled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnerChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token0',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token1',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24'
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tickSpacing',
        type: 'int24'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'pool',
        type: 'address'
      }
    ],
    name: 'PoolCreated',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address'
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24'
      }
    ],
    name: 'createPool',
    outputs: [
      {
        internalType: 'address',
        name: 'pool',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24'
      },
      {
        internalType: 'int24',
        name: 'tickSpacing',
        type: 'int24'
      }
    ],
    name: 'enableFeeAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24'
      }
    ],
    name: 'feeAmountTickSpacing',
    outputs: [
      {
        internalType: 'int24',
        name: '',
        type: 'int24'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '',
        type: 'address'
      },
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24'
      }
    ],
    name: 'getPool',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'parameters',
    outputs: [
      {
        internalType: 'address',
        name: 'factory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'token0',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'token1',
        type: 'address'
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24'
      },
      {
        internalType: 'int24',
        name: 'tickSpacing',
        type: 'int24'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'setOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export const nftPositionManagerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_factory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_WETH9',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_tokenDescriptor_',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'Approval',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool'
      }
    ],
    name: 'ApprovalForAll',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    name: 'Collect',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    name: 'DecreaseLiquidity',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    name: 'IncreaseLiquidity',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'PERMIT_TYPEHASH',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount0Owed',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amount1Owed',
        type: 'uint256'
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes'
      }
    ],
    name: 'PiperXswapV3MintCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'WETH9',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'baseURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address'
          },
          {
            internalType: 'uint128',
            name: 'amount0Max',
            type: 'uint128'
          },
          {
            internalType: 'uint128',
            name: 'amount1Max',
            type: 'uint128'
          }
        ],
        internalType: 'struct INonfungiblePositionManager.CollectParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'collect',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token0',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'token1',
        type: 'address'
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24'
      },
      {
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160'
      }
    ],
    name: 'createAndInitializePoolIfNecessary',
    outputs: [
      {
        internalType: 'address',
        name: 'pool',
        type: 'address'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'uint128',
            name: 'liquidity',
            type: 'uint128'
          },
          {
            internalType: 'uint256',
            name: 'amount0Min',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amount1Min',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct INonfungiblePositionManager.DecreaseLiquidityParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'decreaseLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amount0Desired',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amount1Desired',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amount0Min',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amount1Min',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct INonfungiblePositionManager.IncreaseLiquidityParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'increaseLiquidity',
    outputs: [
      {
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128'
      },
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address'
      }
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'token0',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'token1',
            type: 'address'
          },
          {
            internalType: 'uint24',
            name: 'fee',
            type: 'uint24'
          },
          {
            internalType: 'int24',
            name: 'tickLower',
            type: 'int24'
          },
          {
            internalType: 'int24',
            name: 'tickUpper',
            type: 'int24'
          },
          {
            internalType: 'uint256',
            name: 'amount0Desired',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amount1Desired',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amount0Min',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amount1Min',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct INonfungiblePositionManager.MintParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128'
      },
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'data',
        type: 'bytes[]'
      }
    ],
    name: 'multicall',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'results',
        type: 'bytes[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'positions',
    outputs: [
      {
        internalType: 'uint96',
        name: 'nonce',
        type: 'uint96'
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'token0',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'token1',
        type: 'address'
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24'
      },
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24'
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24'
      },
      {
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128'
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside0LastX128',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside1LastX128',
        type: 'uint256'
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed0',
        type: 'uint128'
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed1',
        type: 'uint128'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'refundETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes'
      }
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'selfPermit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'selfPermitAllowed',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'selfPermitAllowedIfNecessary',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'selfPermitIfNecessary',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address'
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool'
      }
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4'
      }
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      }
    ],
    name: 'sweepToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256'
      }
    ],
    name: 'tokenByIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256'
      }
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      }
    ],
    name: 'unwrapWETH9',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    stateMutability: 'payable',
    type: 'receive'
  }
] as const;

export const piperv3PoolAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24'
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    name: 'Burn',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24'
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128'
      }
    ],
    name: 'Collect',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128'
      }
    ],
    name: 'CollectProtocol',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paid0',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'paid1',
        type: 'uint256'
      }
    ],
    name: 'Flash',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: 'observationCardinalityNextOld',
        type: 'uint16'
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'observationCardinalityNextNew',
        type: 'uint16'
      }
    ],
    name: 'IncreaseObservationCardinalityNext',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160'
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tick',
        type: 'int24'
      }
    ],
    name: 'Initialize',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24'
      },
      {
        indexed: true,
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    name: 'Mint',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol0Old',
        type: 'uint8'
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol1Old',
        type: 'uint8'
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol0New',
        type: 'uint8'
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'feeProtocol1New',
        type: 'uint8'
      }
    ],
    name: 'SetFeeProtocol',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount0',
        type: 'int256'
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount1',
        type: 'int256'
      },
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'int24',
        name: 'tick',
        type: 'int24'
      }
    ],
    name: 'Swap',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24'
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24'
      },
      {
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128'
      }
    ],
    name: 'burn',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24'
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24'
      },
      {
        internalType: 'uint128',
        name: 'amount0Requested',
        type: 'uint128'
      },
      {
        internalType: 'uint128',
        name: 'amount1Requested',
        type: 'uint128'
      }
    ],
    name: 'collect',
    outputs: [
      {
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128'
      },
      {
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'uint128',
        name: 'amount0Requested',
        type: 'uint128'
      },
      {
        internalType: 'uint128',
        name: 'amount1Requested',
        type: 'uint128'
      }
    ],
    name: 'collectProtocol',
    outputs: [
      {
        internalType: 'uint128',
        name: 'amount0',
        type: 'uint128'
      },
      {
        internalType: 'uint128',
        name: 'amount1',
        type: 'uint128'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'fee',
    outputs: [
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'feeGrowthGlobal0X128',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'feeGrowthGlobal1X128',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes'
      }
    ],
    name: 'flash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'observationCardinalityNext',
        type: 'uint16'
      }
    ],
    name: 'increaseObservationCardinalityNext',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160'
      }
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'maxLiquidityPerTick',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24'
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24'
      },
      {
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128'
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes'
      }
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256'
      }
    ],
    name: 'observations',
    outputs: [
      {
        internalType: 'uint32',
        name: 'blockTimestamp',
        type: 'uint32'
      },
      {
        internalType: 'int56',
        name: 'tickCumulative',
        type: 'int56'
      },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityCumulativeX128',
        type: 'uint160'
      },
      {
        internalType: 'bool',
        name: 'initialized',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint32[]',
        name: 'secondsAgos',
        type: 'uint32[]'
      }
    ],
    name: 'observe',
    outputs: [
      {
        internalType: 'int56[]',
        name: 'tickCumulatives',
        type: 'int56[]'
      },
      {
        internalType: 'uint160[]',
        name: 'secondsPerLiquidityCumulativeX128s',
        type: 'uint160[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32'
      }
    ],
    name: 'positions',
    outputs: [
      {
        internalType: 'uint128',
        name: '_liquidity',
        type: 'uint128'
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside0LastX128',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside1LastX128',
        type: 'uint256'
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed0',
        type: 'uint128'
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed1',
        type: 'uint128'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'protocolFees',
    outputs: [
      {
        internalType: 'uint128',
        name: 'token0',
        type: 'uint128'
      },
      {
        internalType: 'uint128',
        name: 'token1',
        type: 'uint128'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'feeProtocol0',
        type: 'uint8'
      },
      {
        internalType: 'uint8',
        name: 'feeProtocol1',
        type: 'uint8'
      }
    ],
    name: 'setFeeProtocol',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      {
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160'
      },
      {
        internalType: 'int24',
        name: 'tick',
        type: 'int24'
      },
      {
        internalType: 'uint16',
        name: 'observationIndex',
        type: 'uint16'
      },
      {
        internalType: 'uint16',
        name: 'observationCardinality',
        type: 'uint16'
      },
      {
        internalType: 'uint16',
        name: 'observationCardinalityNext',
        type: 'uint16'
      },
      {
        internalType: 'uint8',
        name: 'feeProtocol',
        type: 'uint8'
      },
      {
        internalType: 'bool',
        name: 'unlocked',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24'
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24'
      }
    ],
    name: 'snapshotCumulativesInside',
    outputs: [
      {
        internalType: 'int56',
        name: 'tickCumulativeInside',
        type: 'int56'
      },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityInsideX128',
        type: 'uint160'
      },
      {
        internalType: 'uint32',
        name: 'secondsInside',
        type: 'uint32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'bool',
        name: 'zeroForOne',
        type: 'bool'
      },
      {
        internalType: 'int256',
        name: 'amountSpecified',
        type: 'int256'
      },
      {
        internalType: 'uint160',
        name: 'sqrtPriceLimitX96',
        type: 'uint160'
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes'
      }
    ],
    name: 'swap',
    outputs: [
      {
        internalType: 'int256',
        name: 'amount0',
        type: 'int256'
      },
      {
        internalType: 'int256',
        name: 'amount1',
        type: 'int256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'int16',
        name: 'wordPosition',
        type: 'int16'
      }
    ],
    name: 'tickBitmap',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'tickSpacing',
    outputs: [
      {
        internalType: 'int24',
        name: '',
        type: 'int24'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'int24',
        name: 'tick',
        type: 'int24'
      }
    ],
    name: 'ticks',
    outputs: [
      {
        internalType: 'uint128',
        name: 'liquidityGross',
        type: 'uint128'
      },
      {
        internalType: 'int128',
        name: 'liquidityNet',
        type: 'int128'
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthOutside0X128',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthOutside1X128',
        type: 'uint256'
      },
      {
        internalType: 'int56',
        name: 'tickCumulativeOutside',
        type: 'int56'
      },
      {
        internalType: 'uint160',
        name: 'secondsPerLiquidityOutsideX128',
        type: 'uint160'
      },
      {
        internalType: 'uint32',
        name: 'secondsOutside',
        type: 'uint32'
      },
      {
        internalType: 'bool',
        name: 'initialized',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'token0',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const usdcAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'implementationContract',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address'
      }
    ],
    name: 'AdminChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'implementation',
        type: 'address'
      }
    ],
    name: 'Upgraded',
    type: 'event'
  },
  {
    stateMutability: 'payable',
    type: 'fallback'
  },
  {
    inputs: [],
    name: 'admin',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newAdmin',
        type: 'address'
      }
    ],
    name: 'changeAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address'
      }
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address'
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes'
      }
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
];

export const piperv3SwapRouterAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_factory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_WETH9',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'WETH9',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'path',
            type: 'bytes'
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountOutMinimum',
            type: 'uint256'
          }
        ],
        internalType: 'struct ISwapRouter.ExactInputParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInput',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenIn',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'tokenOut',
            type: 'address'
          },
          {
            internalType: 'uint24',
            name: 'fee',
            type: 'uint24'
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountOutMinimum',
            type: 'uint256'
          },
          {
            internalType: 'uint160',
            name: 'sqrtPriceLimitX96',
            type: 'uint160'
          }
        ],
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInputSingle',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'path',
            type: 'bytes'
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountOut',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountInMaximum',
            type: 'uint256'
          }
        ],
        internalType: 'struct ISwapRouter.ExactOutputParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactOutput',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenIn',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'tokenOut',
            type: 'address'
          },
          {
            internalType: 'uint24',
            name: 'fee',
            type: 'uint24'
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountOut',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountInMaximum',
            type: 'uint256'
          },
          {
            internalType: 'uint160',
            name: 'sqrtPriceLimitX96',
            type: 'uint160'
          }
        ],
        internalType: 'struct ISwapRouter.ExactOutputSingleParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactOutputSingle',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'data',
        type: 'bytes[]'
      }
    ],
    name: 'multicall',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'results',
        type: 'bytes[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'refundETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'selfPermit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'selfPermitAllowed',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'selfPermitAllowedIfNecessary',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'selfPermitIfNecessary',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      }
    ],
    name: 'sweepToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'feeBips',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'feeRecipient',
        type: 'address'
      }
    ],
    name: 'sweepTokenWithFee',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'amount0Delta',
        type: 'int256'
      },
      {
        internalType: 'int256',
        name: 'amount1Delta',
        type: 'int256'
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes'
      }
    ],
    name: 'uniswapV3SwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      }
    ],
    name: 'unwrapWETH9',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'feeBips',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'feeRecipient',
        type: 'address'
      }
    ],
    name: 'unwrapWETH9WithFee',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    stateMutability: 'payable',
    type: 'receive'
  }
];

export const IPeripheryPaymentsWithFeeAbi = [
  {
    inputs: [],
    name: 'refundETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      }
    ],
    name: 'sweepToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'feeBips',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'feeRecipient',
        type: 'address'
      }
    ],
    name: 'sweepTokenWithFee',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      }
    ],
    name: 'unwrapWETH9',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'feeBips',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'feeRecipient',
        type: 'address'
      }
    ],
    name: 'unwrapWETH9WithFee',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;
