// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';

export function getCardanoAssetId (chainAsset: _ChainAsset): string {
  // @ts-ignore
  return chainAsset.metadata.policy_id as string;
}

export function isCardanoAddress (address: string): boolean {
  return address.startsWith('addr1') || address.startsWith('addr_test1');
}
