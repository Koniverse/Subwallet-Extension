// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface BuyService {
  network: string;
  symbol: string;
  supportSell: boolean;
}

export type SupportService = 'transak' | 'banxa' | 'coinbase' | 'moonpay' | 'onramper';

export interface BuyTokenInfo {
  network: string;
  symbol: string;
  slug: string;
  support: 'ETHEREUM' | 'SUBSTRATE';
  services: Array<SupportService>;
  serviceInfo: Record<SupportService, BuyService>;
}

export interface BuyServiceInfo {
  name: string;
  contactUrl: string;
  termUrl: string;
  policyUrl: string;
  url: string;
}
