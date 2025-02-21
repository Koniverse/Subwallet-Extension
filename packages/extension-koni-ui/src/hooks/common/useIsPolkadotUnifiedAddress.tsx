// [object Object]
// SPDX-License-Identifier: Apache-2.0

import { UNIFIED_POLKADOT_CHAIN_SLUGS } from '@subwallet/extension-koni-ui/constants';
import { isSubstrateAddress } from '@subwallet/keyring';
import { useMemo } from 'react';

const useIsPolkadotUnifiedAddress = (item: { slug?: string; address: string }): boolean => {
  return useMemo(() => {
    return (
      UNIFIED_POLKADOT_CHAIN_SLUGS.some((slug) => item.slug === slug) &&
      isSubstrateAddress(item.address)
    );
  }, [item.slug, item.address]);
};

export default useIsPolkadotUnifiedAddress;
