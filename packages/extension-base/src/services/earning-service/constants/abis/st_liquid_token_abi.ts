// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export const ST_LIQUID_TOKEN_ABI = [
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
        name: 'spender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
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
        name: 'receiver',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'Claimed',
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
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256'
      }
    ],
    name: 'Deposited',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: 'fee',
        type: 'uint16'
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'feeTreasuryBP',
        type: 'uint16'
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'feeDevelopersBP',
        type: 'uint16'
      }
    ],
    name: 'FeeSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'addr',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'stashAccount',
        type: 'bytes32'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'controllerAccount',
        type: 'bytes32'
      }
    ],
    name: 'LedgerAdd',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'addr',
        type: 'address'
      }
    ],
    name: 'LedgerDisable',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'addr',
        type: 'address'
      }
    ],
    name: 'LedgerPaused',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'addr',
        type: 'address'
      }
    ],
    name: 'LedgerRemove',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'addr',
        type: 'address'
      }
    ],
    name: 'LedgerResumed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'ledger',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'losses',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256'
      }
    ],
    name: 'Losses',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'Paused',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256'
      }
    ],
    name: 'Redeemed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'userAddr',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'referralAddr',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256'
      }
    ],
    name: 'Referral',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'ledger',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewards',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256'
      }
    ],
    name: 'Rewards',
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
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'Unpaused',
    type: 'event'
  },
  {
    inputs: [

    ],
    name: 'AUTH_MANAGER',
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

    ],
    name: 'LEDGER_BEACON',
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

    ],
    name: 'MAX_ALLOWABLE_DIFFERENCE',
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

    ],
    name: 'ORACLE_MASTER',
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
        internalType: 'bytes32',
        name: '_stashAccount',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: '_controllerAccount',
        type: 'bytes32'
      },
      {
        internalType: 'uint16',
        name: '_index',
        type: 'uint16'
      },
      {
        internalType: 'bool',
        name: 'isMsig',
        type: 'bool'
      }
    ],
    name: 'addLedger',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_spender',
        type: 'address'
      }
    ],
    name: 'allowance',
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
        name: '_spender',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_account',
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
    inputs: [

    ],
    name: 'bufferedDeposits',
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

    ],
    name: 'bufferedRedeems',
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

    ],
    name: 'claimUnbonded',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [

    ],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_spender',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_subtractedValue',
        type: 'uint256'
      }
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: '_referral',
        type: 'address'
      }
    ],
    name: 'deposit',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
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
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'deposit',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [

    ],
    name: 'depositCap',
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
        name: '_ledgerAddress',
        type: 'address'
      }
    ],
    name: 'disableLedger',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_totalLosses',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_ledgerBalance',
        type: 'uint256'
      }
    ],
    name: 'distributeLosses',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_totalRewards',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_ledgerBalance',
        type: 'uint256'
      }
    ],
    name: 'distributeRewards',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_ledgerAddress',
        type: 'address'
      }
    ],
    name: 'emergencyPauseLedger',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_stashAccount',
        type: 'bytes32'
      }
    ],
    name: 'findLedger',
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

    ],
    name: 'flushStakes',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [

    ],
    name: 'fundRaisedBalance',
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

    ],
    name: 'getLedgerAddresses',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_sharesAmount',
        type: 'uint256'
      }
    ],
    name: 'getPooledTokenByShares',
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
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'getSharesByPooledToken',
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

    ],
    name: 'getStashAccounts',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [

    ],
    name: 'getTotalPooledToken',
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
        name: '_holder',
        type: 'address'
      }
    ],
    name: 'getUnbonded',
    outputs: [
      {
        internalType: 'uint256',
        name: 'waiting',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'unbonded',
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
        name: '_spender',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_addedValue',
        type: 'uint256'
      }
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_authManager',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_xcTOKEN',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_controller',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_developers',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_treasury',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_oracleMaster',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_withdrawal',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_depositCap',
        type: 'uint256'
      },
      {
        internalType: 'uint128',
        name: '_maxAllowableDifference',
        type: 'uint128'
      },
      {
        internalType: 'string',
        name: '__name',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '__symbol',
        type: 'string'
      },
      {
        internalType: 'uint8',
        name: '__decimals',
        type: 'uint8'
      }
    ],
    name: 'initialize',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'ledgerBorrow',
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
        name: '',
        type: 'address'
      }
    ],
    name: 'ledgerStake',
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

    ],
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
        internalType: 'bytes32[]',
        name: '_stashAccounts',
        type: 'bytes32[]'
      },
      {
        internalType: 'bytes32[][]',
        name: '_validators',
        type: 'bytes32[][]'
      }
    ],
    name: 'nominateBatch',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [

    ],
    name: 'pause',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [

    ],
    name: 'paused',
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
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'redeem',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_ledgerAddress',
        type: 'address'
      }
    ],
    name: 'removeLedger',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [

    ],
    name: 'resume',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_ledgerAddress',
        type: 'address'
      }
    ],
    name: 'resumeLedger',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_depositCap',
        type: 'uint256'
      }
    ],
    name: 'setDepositCap',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_treasury',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_developers',
        type: 'address'
      }
    ],
    name: 'setDevelopersTreasury',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_feeTreasury',
        type: 'uint16'
      },
      {
        internalType: 'uint16',
        name: '_feeDevelopers',
        type: 'uint16'
      }
    ],
    name: 'setFee',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_ledgerBeacon',
        type: 'address'
      }
    ],
    name: 'setLedgerBeacon',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_ledgerFactory',
        type: 'address'
      }
    ],
    name: 'setLedgerFactory',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint128',
        name: '_maxAllowableDifference',
        type: 'uint128'
      }
    ],
    name: 'setMaxAllowableDifference',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint16',
            name: 'maxValidatorsPerLedger',
            type: 'uint16'
          },
          {
            internalType: 'uint128',
            name: 'minNominatorBalance',
            type: 'uint128'
          },
          {
            internalType: 'uint128',
            name: 'ledgerMinimumActiveBalance',
            type: 'uint128'
          },
          {
            internalType: 'uint256',
            name: 'maxUnlockingChunks',
            type: 'uint256'
          }
        ],
        internalType: 'struct Types.RelaySpec',
        name: '_relaySpec',
        type: 'tuple'
      }
    ],
    name: 'setRelaySpec',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [

    ],
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

    ],
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
        name: '_recipient',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sender',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_excess',
        type: 'uint256'
      }
    ],
    name: 'transferFromLedger',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'transferToLedger',
    outputs: [

    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;
