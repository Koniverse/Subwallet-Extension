// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { APIItemState } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceItem } from '@subwallet/extension-base/types';
import { sumBN } from '@subwallet/extension-base/utils';
import BN from 'bn.js';

/**
 * Group the balance of {token} from {items} into {address}
 * @param {BalanceItem[]} items - List balance want to group
 * @param {string} address - Address will be grouped to
 * @param {string} token - Slug of token will be group balance
 * @return {BalanceItem} - Grouped balance information of token
 */
export const groupBalance = (items: BalanceItem[], address: string, token: string): BalanceItem => {
  const states = items.map((item) => item.state);

  return {
    address,
    tokenSlug: token,
    free: sumBN(items.map((item) => new BN(item.free))).toString(),
    frozen: sumBN(items.map((item) => new BN(item.frozen))).toString(),
    pooled: sumBN(items.map((item) => new BN(item.pooled))).toString(),
    reserved: sumBN(items.map((item) => new BN(item.reserved))).toString(),
    state: states.every((item) => item === APIItemState.NOT_SUPPORT)
      ? APIItemState.NOT_SUPPORT
      : states.some((item) => item === APIItemState.READY)
        ? APIItemState.READY
        : APIItemState.PENDING
  };
};
