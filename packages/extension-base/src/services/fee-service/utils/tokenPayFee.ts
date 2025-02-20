// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _AssetType, _ChainAsset } from '@subwallet/chain-list/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { checkLiquidityForPool, estimateTokensForPool, getReserveForPool } from '@subwallet/extension-base/services/swap-service/handler/asset-hub/utils';
import { BalanceItem } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';

export async function getAssetHubTokensCanPayFee (substrateApi: _SubstrateApi, chainService: ChainService, nativeTokenInfo: _ChainAsset, tokensHasBalanceInfoMap: Record<string, BalanceItem>, feeAmount?: string): Promise<TokenHasBalanceInfo[]> {
  const tokensList: TokenHasBalanceInfo[] = [];

  if (!(nativeTokenInfo.metadata && nativeTokenInfo.metadata.multilocation)) {
    return tokensList;
  }

  // ensure nativeTokenInfo and localTokenInfo have multi-location metadata beforehand to improve performance.
  const tokensHasBalanceSlug = Object.keys(tokensHasBalanceInfoMap);
  const tokenInfos = tokensHasBalanceSlug.map((tokenSlug) => chainService.getAssetBySlug(tokenSlug)).filter((token) => (
    token.originChain === substrateApi.chainSlug &&
    token.assetType !== _AssetType.NATIVE &&
    token.metadata &&
    token.metadata.multilocation
  ));

  await Promise.all(tokenInfos.map(async (tokenInfo) => {
    const tokenSlug = tokenInfo.slug;
    const reserve = await getReserveForPool(substrateApi.api, nativeTokenInfo, tokenInfo);

    if (!reserve || !reserve[0] || !reserve[1] || reserve[0] === '0' || reserve[1] === '0') {
      return;
    }

    const rate = new BigN(reserve[1]).div(reserve[0]).toFixed();
    const tokenCanPayFee = {
      slug: tokenSlug,
      free: tokensHasBalanceInfoMap[tokenSlug].free,
      rate
    };

    if (feeAmount === undefined) {
      tokensList.push(tokenCanPayFee);
    } else {
      const amount = estimateTokensForPool(feeAmount, reserve);
      const liquidityError = checkLiquidityForPool(amount, reserve[0], reserve[1]);

      if (!liquidityError) {
        tokensList.push(tokenCanPayFee);
      }
    }
  }));

  return tokensList;
}

export async function getHydrationTokensCanPayFee (substrateApi: _SubstrateApi, chainService: ChainService, nativeTokenInfo: _ChainAsset, tokensHasBalanceInfoMap: Record<string, BalanceItem>, feeAmount?: string): Promise<TokenHasBalanceInfo[]> {
  return [];
}
