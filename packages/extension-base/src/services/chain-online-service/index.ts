// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AssetLogoMap, ChainLogoMap, MultiChainAssetMap } from '@subwallet/chain-list';
import { _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import { LATEST_CHAIN_PATCH_FETCHING_INTERVAL } from '@subwallet/extension-base/services/chain-online-service/constants';
import { ChainService, filterAssetInfoMap } from '@subwallet/extension-base/services/chain-service';
import { _ChainApiStatus, _ChainConnectionStatus, _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { fetchPatchData, PatchInfo, randomizeProvider } from '@subwallet/extension-base/services/chain-service/utils';
import { EventService } from '@subwallet/extension-base/services/event-service';
import SettingService from '@subwallet/extension-base/services/setting-service/SettingService';
import { IChain } from '@subwallet/extension-base/services/storage-service/databases';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';
import { Md5 } from 'ts-md5';

export class ChainOnlineService {
  private chainService: ChainService;
  private settingService: SettingService;
  private eventService: EventService;
  private dbService: DatabaseService;

  refreshLatestChainDataTimeOut: NodeJS.Timer | undefined;

  constructor (chainService: ChainService, settingService: SettingService, eventService: EventService, dbService: DatabaseService) {
    this.chainService = chainService;
    this.settingService = settingService;
    this.eventService = eventService;
    this.dbService = dbService;
  }

  md5Hash (data: any) {
    return Md5.hashStr(JSON.stringify(data));
  }

  validatePatchWithHash (latestPatch: PatchInfo) {
    const { ChainAsset, ChainAssetHashMap, ChainInfo, ChainInfoHashMap, MultiChainAsset, MultiChainAssetHashMap } = latestPatch;

    for (const [chainSlug, chain] of Object.entries(ChainInfo)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { chainStatus, providers, ...chainWithoutProvidersAndStatus } = chain;

      if (this.md5Hash(chainWithoutProvidersAndStatus) !== ChainInfoHashMap[chainSlug]) {
        return false;
      }
    }

    for (const [assetSlug, asset] of Object.entries(ChainAsset)) {
      if (this.md5Hash(asset) !== ChainAssetHashMap[assetSlug]) {
        return false;
      }
    }

    for (const [mAssetSlug, mAsset] of Object.entries(MultiChainAsset)) {
      if (this.md5Hash(mAsset) !== MultiChainAssetHashMap[mAssetSlug]) {
        return false;
      }
    }

    return true;
  }

  validatePatchBeforeStore (candidateChainInfoMap: Record<string, _ChainInfo>, candidateAssetRegistry: Record<string, _ChainAsset>, candidateMultiChainAssetMap: Record<string, _MultiChainAsset>, latestPatch: PatchInfo) {
    for (const [chainSlug, chainHash] of Object.entries(latestPatch.ChainInfoHashMap)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { chainStatus, providers, ...chainWithoutProvidersAndStatus } = candidateChainInfoMap[chainSlug];

      if (this.md5Hash(chainWithoutProvidersAndStatus) !== chainHash) {
        return false;
      }
    }

    for (const [assetSlug, assetHash] of Object.entries(latestPatch.ChainAssetHashMap)) {
      if (!candidateAssetRegistry[assetSlug]) {
        if (!latestPatch.ChainInfo[assetSlug]) { // assets are not existed in case chain is removed
          continue;
        }

        return false;
      }

      if (this.md5Hash(candidateAssetRegistry[assetSlug]) !== assetHash) {
        return false;
      }
    }

    for (const [mAssetSlug, mAssetHash] of Object.entries(latestPatch.MultiChainAssetHashMap)) {
      if (this.md5Hash(candidateMultiChainAssetMap[mAssetSlug]) !== mAssetHash) {
        return false;
      }
    }

    return true;
  }

  async handleLatestPatch (latestPatch: PatchInfo) {
    try {
      // 1. validate fetch data with its hash
      const isSafePatch = this.validatePatchWithHash(latestPatch);
      const { AssetLogoMap: latestAssetLogoMap,
        ChainAsset: latestAssetInfo,
        ChainInfo: latestChainInfo,
        ChainLogoMap: latestChainLogoMap,
        MultiChainAsset: latestMultiChainAsset,
        mAssetLogoMap: lastestMAssetLogoMap,
        patchVersion: latestPatchVersion } = latestPatch;
      const currentPatchVersion = (await this.settingService.getChainlistSetting())?.patchVersion || '';

      let chainInfoMap: Record<string, _ChainInfo> = structuredClone(this.chainService.getChainInfoMap());
      let assetRegistry: Record<string, _ChainAsset> = structuredClone(this.chainService.getAssetRegistry());
      let multiChainAssetMap: Record<string, _MultiChainAsset> = structuredClone(MultiChainAssetMap);
      let currentChainStateMap: Record<string, _ChainState> = structuredClone(this.chainService.getChainStateMap());
      let currentChainStatusMap: Record<string, _ChainApiStatus> = structuredClone(this.chainService.getChainStatusMap());
      let addedChain: string[] = [];

      if (isSafePatch && currentPatchVersion !== latestPatchVersion) {
        // 2. merge data map
        if (latestChainInfo && Object.keys(latestChainInfo).length > 0) {
          chainInfoMap = Object.assign({}, this.chainService.getChainInfoMap(), latestChainInfo);

          [currentChainStateMap, currentChainStatusMap] = [structuredClone(this.chainService.getChainStateMap()), structuredClone(this.chainService.getChainStatusMap())];

          const [currentChainStateKey, newChainKey] = [Object.keys(currentChainStateMap), Object.keys(chainInfoMap)];

          addedChain = newChainKey.filter((chain) => !currentChainStateKey.includes(chain));

          addedChain.forEach((key) => {
            currentChainStateMap[key] = {
              active: false,
              currentProvider: randomizeProvider(chainInfoMap[key].providers).providerKey,
              manualTurnOff: false,
              slug: key
            };

            currentChainStatusMap[key] = {
              slug: key,
              connectionStatus: _ChainConnectionStatus.DISCONNECTED,
              lastUpdated: Date.now()
            };
          });
        }

        if (latestAssetInfo && Object.keys(latestAssetInfo).length > 0) {
          assetRegistry = filterAssetInfoMap(this.chainService.getChainInfoMap(), Object.assign({}, this.chainService.getAssetRegistry(), latestAssetInfo), addedChain);
        }

        if (latestMultiChainAsset && Object.keys(latestMultiChainAsset).length > 0) { // todo: currently not support update latest multichain-asset
          multiChainAssetMap = { ...MultiChainAssetMap, ...latestMultiChainAsset };
        }

        // 3. validate data before write
        const isCorrectPatch = this.validatePatchBeforeStore(chainInfoMap, assetRegistry, multiChainAssetMap, latestPatch);

        // 4. write to subject
        if (isCorrectPatch) {
          this.chainService.setChainInfoMap(chainInfoMap);
          this.chainService.subscribeChainInfoMap().next(chainInfoMap);

          this.chainService.setAssetRegistry(assetRegistry);
          this.chainService.subscribeAssetRegistry().next(assetRegistry);
          this.chainService.autoEnableTokens()
            .then(() => {
              this.eventService.emit('asset.updateState', '');
            })
            .catch(console.error);

          this.chainService.subscribeMultiChainAssetMap().next(multiChainAssetMap);

          this.chainService.setChainStateMap(currentChainStateMap);
          this.chainService.subscribeChainStateMap().next(currentChainStateMap);

          this.chainService.subscribeChainStatusMap().next(currentChainStatusMap);

          const storedChainInfoList: IChain[] = Object.keys(chainInfoMap).map((chainSlug) => {
            return {
              ...chainInfoMap[chainSlug],
              ...currentChainStateMap[chainSlug]
            };
          });

          await this.dbService.bulkUpdateChainStore(storedChainInfoList);

          const addedAssets: _ChainAsset[] = [];

          Object.entries(assetRegistry).forEach(([slug, asset]) => {
            if (addedChain.includes(asset.originChain)) {
              addedAssets.push(asset);
            }
          });

          await this.dbService.bulkUpdateAssetsStore(addedAssets);

          if (latestChainLogoMap) {
            const logoMap = Object.assign({}, ChainLogoMap, latestChainLogoMap);

            this.chainService.subscribeChainLogoMap().next(logoMap);
          }

          if (latestAssetLogoMap) {
            const logoMap = Object.assign({}, AssetLogoMap, latestAssetLogoMap, lastestMAssetLogoMap);

            this.chainService.subscribeAssetLogoMap().next(logoMap);
          }

          this.settingService.setChainlist({ patchVersion: latestPatchVersion });
        }
      }
    } catch (e) {
      console.error('Error fetching latest patch data');
    }
  }

  private async fetchLatestPatchData () {
    return await fetchPatchData<PatchInfo>('data.json');
  }

  handleLatestPatchData () {
    this.fetchLatestPatchData()
      .then((latestPatch) => {
        return new Promise<void>((resolve) => {
          if (latestPatch && !this.chainService.getlockChainInfoMap()) {
            this.eventService.waitAssetReady
              .then(() => {
                this.chainService.setLockChainInfoMap(true);
                this.handleLatestPatch(latestPatch)
                  .then(() => this.chainService.setLockChainInfoMap(false))
                  .catch((e) => {
                    this.chainService.setLockChainInfoMap(false);
                    console.error('Error update latest patch', e);
                  })
                  .finally(resolve);
              })
              .catch((e) => {
                console.error('Asset fail to ready', e);
                resolve();
              });
          } else {
            resolve();
          }
        });
      }).catch((e) => {
        console.error('Error get latest patch or data map is locking', e);
      }).finally(() => {
        this.eventService.emit('asset.online.ready', true);
      });
  }

  checkLatestData () {
    clearInterval(this.refreshLatestChainDataTimeOut);
    this.handleLatestPatchData();

    this.refreshLatestChainDataTimeOut = setInterval(this.handleLatestPatchData.bind(this), LATEST_CHAIN_PATCH_FETCHING_INTERVAL);
  }
}
