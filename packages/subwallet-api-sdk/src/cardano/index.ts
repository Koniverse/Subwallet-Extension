// Copyright 2017-2022 @subwallet/subwallet-api-sdk authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BuildCardanoTxParams, getFirstNumberAfterSubstring, POPULAR_CARDANO_ERROR_PHRASE, toUnit } from '@subwallet/subwallet-api-sdk/cardano/utils';
import { SWApiResponse, SWApiResponseError, SWApiResponseSuccess } from '@subwallet/subwallet-api-sdk/types';

export async function fetchUnsignedPayload (baseUrl: string, params: BuildCardanoTxParams) {
  const searchParams = new URLSearchParams({
    sender: params.from,
    receiver: params.to,
    unit: params.cardanoId,
    quantity: params.value
  });

  if (params.cardanoTtlOffset) {
    searchParams.append('ttl', params.cardanoTtlOffset.toString());
  }

  try {
    const rawResponse = await fetch(baseUrl + searchParams.toString(), {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const response = await rawResponse.json() as SWApiResponse<string>;

    if (response.status === 'error') {
      const error = (response as SWApiResponseError).error;

      throw new Error(error.message);
    }

    return (response as SWApiResponseSuccess<string>).data;
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes(POPULAR_CARDANO_ERROR_PHRASE.NOT_MATCH_MIN_AMOUNT)) {
      const decimal = params.tokenDecimals;
      const minAdaRequiredRaw = getFirstNumberAfterSubstring(errorMessage, POPULAR_CARDANO_ERROR_PHRASE.NOT_MATCH_MIN_AMOUNT);
      const minAdaRequired = minAdaRequiredRaw ? toUnit(minAdaRequiredRaw, decimal) : 1;

      throw new Error(`Minimum ${minAdaRequired} ADA is required`);
    }

    if (errorMessage.includes(POPULAR_CARDANO_ERROR_PHRASE.INSUFFICIENT_INPUT)) {
      throw new Error('Not enough ADA to make this transaction');
    }

    throw new Error(`Transaction is not built successfully: ${errorMessage}`);
  }
}
