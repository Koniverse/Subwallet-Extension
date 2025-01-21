// Copyright 2019-2022 @subwallet/web-runner authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@subwallet/extension-inject/crossenv';

import { APP_ENV, APP_VER, EnvConfig } from '@subwallet/extension-base/constants';
import { SWHandler } from '@subwallet/extension-base/koni/background/handlers';
import { AccountsStore } from '@subwallet/extension-base/stores';
import KeyringStore from '@subwallet/extension-base/stores/Keyring';
import { platformModel, platformType } from '@subwallet/extension-base/utils';
import keyring from '@subwallet/ui-keyring';

import { cryptoWaitReady } from '@polkadot/util-crypto';

import { PageStatus, responseMessage, setupHandlers } from './messageHandle';

responseMessage({ id: '0', response: { status: 'load' } } as PageStatus);

const koniState = SWHandler.instance.state;

setupHandlers();

// Initial setup
Promise.all([cryptoWaitReady()])
  .then((): void => {
    console.log('[Mobile] crypto initialized');

    const envConfig: EnvConfig = {
      appConfig: {
        environment: APP_ENV,
        version: APP_VER
      },
      browserConfig: undefined,
      osConfig: {
        type: platformType as string,
        version: platformModel
      }
    };

    koniState.initEnvConfig(envConfig);

    // load all the keyring data
    keyring.loadAll({ store: new AccountsStore(), type: 'sr25519', password_store: new KeyringStore() });

    keyring.restoreKeyringPassword().finally(() => {
      koniState.updateKeyringState();
    });

    koniState.eventService.emit('crypto.ready', true);

    // Manual Init koniState
    koniState.init().catch((err) => console.warn(err));

    responseMessage({ id: '0', response: { status: 'crypto_ready' } } as PageStatus);

    console.log('[Mobile] initialization completed');
  })
  .catch((error): void => {
    console.error('[Mobile] initialization failed', error);
  });

// @ts-ignore
window.SubWalletState = koniState;
