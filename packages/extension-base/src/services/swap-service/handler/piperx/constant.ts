// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export const fee2TickSpace: { [key: string]: number } = {
  10000: 200,
  3000: 60,
  500: 10
};

export const PIPERX_SWAP_ADDRESSES = {
  testnet: {
    defaultTokens: [
      '0x40fCa9cB1AB15eD9B5bDA19A52ac00A78AE08e1D',
      '0x02F75bdBb4732cc6419aC15EeBeE6BCee66e826f',
      '0x6D46EF45795B1c3e2a5f2A3F7aba5ea551be966f'
    ],
    WIP_ADDRESS: '0xe8CabF9d1FFB6CE23cF0a86641849543ec7BD7d5',
    v2FactoryAddress: '0x700722D24f9256Be288f56449E8AB1D27C4a70ca',
    v2RouterAddress: '0x8812d810EA7CC4e1c3FB45cef19D6a7ECBf2D85D',
    piperv3QuoterAddress: '0x82C210d4aA5948f68E46Af355C0399c2E921e8e4',
    piperv3SwapRouterAddress: '0xbBb8B63596d5447a12Ddee557ac9fA326f42B57D',
    piperv3FactoryAddress: '0xf3d448d7A83F749695c49d8411247fC3868fB633',
    piperv3NFTPositionManagerAddress: '0xf03c65d9be145746f800E2781eD140F6dd238F38',
    multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11'
  },
  mainnet: {
    defaultTokens: [
      '0x40fCa9cB1AB15eD9B5bDA19A52ac00A78AE08e1D',
      '0x02F75bdBb4732cc6419aC15EeBeE6BCee66e826f',
      '0x6D46EF45795B1c3e2a5f2A3F7aba5ea551be966f'
    ],
    WIP_ADDRESS: '0x1514000000000000000000000000000000000000',
    v2FactoryAddress: '0x6D3e2f58954bf4E1d0C4bA26a85a1b49b2e244C6',
    v2RouterAddress: '0x674eFAa8C50cBEF923ECe625d3c276B7Bb1c16fB',
    piperv3QuoterAddress: '0xe8CabF9d1FFB6CE23cF0a86641849543ec7BD7d5',
    piperv3SwapRouterAddress: '0x8295c195CEe31404ea082d253a140310b9a0A37e',
    piperv3FactoryAddress: '0xb8c21e89983B5EcCD841846eA294c4c8a89718f1',
    piperv3NFTPositionManagerAddress: '0x700722D24f9256Be288f56449E8AB1D27C4a70ca',
    multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11'
  }
};

// export const v2ComputeAddress = (token0: string, token1: string) => {
//   const [token0Sorted, token1Sorted] = token0.toLowerCase() < token1.toLowerCase()
//     ? [token0, token1]
//     : [token1, token0];

//   const salt = keccak256(solidityPacked(['address', 'address'], [token0Sorted, token1Sorted]));
//   const initCodeHash = '0x754f724019203c806610a02ada224eb21dbe068a93d50486e52cf0ae30de457a';

//   return getCreate2Address(v2FactoryAddress, salt, initCodeHash) as `0x${string}`;
// };
