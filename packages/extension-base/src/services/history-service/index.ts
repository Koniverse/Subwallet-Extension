// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicStatus, TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { CRON_RECOVER_HISTORY_INTERVAL } from '@subwallet/extension-base/constants';
import { PersistDataServiceInterface, ServiceStatus, StoppableServiceInterface } from '@subwallet/extension-base/services/base/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { getExtrinsicParserKey, supportedExtrinsicParser } from '@subwallet/extension-base/services/history-service/extrinsic-parser';
import { historyRecover, HistoryRecoverStatus } from '@subwallet/extension-base/services/history-service/helpers/recoverHistoryStatus';
import { parseSubscanExtrinsicData, parseSubscanTransferData } from '@subwallet/extension-base/services/history-service/subscan-history';
import { KeyringService } from '@subwallet/extension-base/services/keyring-service';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';
import { SubscanService } from '@subwallet/extension-base/services/subscan-service';
import SUBSCAN_CHAIN_MAP from '@subwallet/extension-base/services/subscan-service/subscan-chain-map';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { createPromiseHandler } from '@subwallet/extension-base/utils/promise';
import { keyring } from '@subwallet/ui-keyring';
import { BehaviorSubject } from 'rxjs';

function filterHistoryItemByAddressAndChain (chain: string, address: string) {
  return (item: TransactionHistoryItem) => {
    return item.chain === chain && item.address === address;
  };
}

export class HistoryService implements StoppableServiceInterface, PersistDataServiceInterface {
  private historySubject: BehaviorSubject<TransactionHistoryItem[]> = new BehaviorSubject([] as TransactionHistoryItem[]);
  #needRecoveryHistories: Record<string, TransactionHistoryItem> = {};

  constructor (
    private dbService: DatabaseService,
    private chainService: ChainService,
    private eventService: EventService,
    private keyringService: KeyringService,
    private subscanService: SubscanService
  ) {
    this.init().catch(console.error);
  }

  private fetchPromise: Promise<void> | null = null;
  private recoverInterval: NodeJS.Timer | undefined = undefined;

  private async fetchAndLoadHistories (addresses: string[]): Promise<TransactionHistoryItem[]> {
    if (!addresses || addresses.length === 0) {
      return [];
    }

    // Query data from subscan or any indexer
    // const chainMap = this.chainService.getChainInfoMap();
    // const historyRecords = await fetchMultiChainHistories(addresses, chainMap);
    // Pause deprecated until have new update
    const historyRecords = [] as TransactionHistoryItem[];

    // Fill additional info
    const accountMap = Object.entries(this.keyringService.accounts).reduce((map, [address, account]) => {
      map[address.toLowerCase()] = account.json.meta.name || address;

      return map;
    }, {} as Record<string, string>);

    historyRecords.forEach((record) => {
      record.fromName = accountMap[record.from?.toLowerCase()];
      record.toName = accountMap[record.to?.toLowerCase()];
    });

    await this.addHistoryItems(historyRecords);

    return historyRecords;
  }

  public async getHistories () {
    const addressList = keyring.getAccounts().map((a) => a.address);

    if (!this.fetchPromise) {
      this.fetchPromise = (async () => {
        await this.fetchAndLoadHistories(addressList);
        const histories = await this.dbService.getHistories();

        this.historySubject.next(histories);
      })();
    }

    return Promise.resolve(this.historySubject.getValue());
  }

  public async getHistorySubject () {
    await this.getHistories();

    return this.historySubject;
  }

  private async fetchSubscanTransactionHistory (chain: string, address: string) {
    const result: TransactionHistoryItem[] = [];

    // todo: optimise this: reduce unnessary query
    const extrinsicItems = await this.subscanService.getAllExtrinsicItems(chain, address);
    const transferItems = await this.subscanService.getAllTransferItems(chain, address);
    const chainInfo = this.chainService.getChainInfoByKey(chain);

    const excludeTransferExtrinsicHash: string[] = [];

    extrinsicItems.forEach((x) => {
      excludeTransferExtrinsicHash.push(x.extrinsic_hash);

      if (supportedExtrinsicParser.includes(getExtrinsicParserKey(x))) {
        result.push(parseSubscanExtrinsicData(address, x, chainInfo));
      }
    });

    transferItems.forEach((t) => {
      if (!excludeTransferExtrinsicHash.includes(t.hash)) {
        result.push(parseSubscanTransferData(address, t, chainInfo));
      }
    });

    await this.addHistoryItems(result);

    return result;
  }

  async subscribeHistories (chain: string, address: string, cb: (items: TransactionHistoryItem[]) => void) {
    const _address = reformatAddress(address);
    const historySubject = new BehaviorSubject(this.historySubject.getValue().filter(filterHistoryItemByAddressAndChain(chain, _address)));

    this.historySubject.subscribe((items) => {
      historySubject.next(items.filter(filterHistoryItemByAddressAndChain(chain, _address)));
    });

    if (SUBSCAN_CHAIN_MAP[chain]) {
      await this.fetchSubscanTransactionHistory(chain, _address);
    }

    return historySubject.subscribe((items) => {
      cb(items);
    });
  }

  async updateHistories (chain: string, extrinsicHash: string, updateData: Partial<TransactionHistoryItem>) {
    const existedRecords = await this.dbService.getHistories({ chain, extrinsicHash });
    const updatedRecords = existedRecords.map((r) => {
      return { ...r, ...updateData };
    });

    await this.addHistoryItems(updatedRecords);
  }

  async updateHistoryByExtrinsicHash (extrinsicHash: string, updateData: Partial<TransactionHistoryItem>) {
    await this.dbService.updateHistoryByExtrinsicHash(extrinsicHash, updateData);
    this.historySubject.next(await this.dbService.getHistories());
  }

  // Insert history without check override origin 'app'
  async insertHistories (historyItems: TransactionHistoryItem[]) {
    await this.dbService.upsertHistory(historyItems);
    this.historySubject.next(await this.dbService.getHistories());
  }

  // Insert history with check override origin 'app'
  async addHistoryItems (historyItems: TransactionHistoryItem[]) {
    // Prevent override record with original is 'app'
    const appRecords = this.historySubject.value.filter((item) => item.origin === 'app');
    const excludeKeys = appRecords.map((item) => {
      return `${item.chain}-${item.extrinsicHash}`;
    });

    const updateRecords = historyItems.filter((item) => {
      const key = `${item.chain}-${item.extrinsicHash}`;

      return item.origin === 'app' || !excludeKeys.includes(key);
    });

    await this.dbService.upsertHistory(updateRecords);
    this.historySubject.next(await this.dbService.getHistories());
  }

  async removeHistoryByAddress (address: string) {
    await this.dbService.stores.transaction.removeAllByAddress(address);
    this.historySubject.next(await this.dbService.getHistories());
  }

  status: ServiceStatus = ServiceStatus.NOT_INITIALIZED;

  async loadData (): Promise<void> {
    const histories = await this.dbService.getHistories();

    this.historySubject.next(histories);
  }

  async persistData (): Promise<void> {
    await this.dbService.upsertHistory(this.historySubject.value);
  }

  async startRecoverHistories (): Promise<void> {
    await this.recoverHistories();

    this.recoverInterval = setInterval(() => {
      this.recoverHistories().catch(console.error);
    }, CRON_RECOVER_HISTORY_INTERVAL);
  }

  stopRecoverHistories (): Promise<void> {
    clearInterval(this.recoverInterval);

    return Promise.resolve();
  }

  async recoverHistories (): Promise<void> {
    const list: TransactionHistoryItem[] = [];

    for (const processingHistory of Object.values(this.#needRecoveryHistories)) {
      const chainState = this.chainService.getChainStateByKey(processingHistory.chain);

      if (chainState.active) {
        list.push(processingHistory);
      }

      if (list.length >= 10) {
        break;
      }
    }

    const promises = list.map((history) => historyRecover(history, this.chainService));

    const results = await Promise.all(promises);

    results.forEach((recoverResult, index) => {
      const currentExtrinsicHash = list[index].extrinsicHash;

      const updateData: Partial<TransactionHistoryItem> = {
        ...recoverResult,
        status: ExtrinsicStatus.UNKNOWN
      };

      switch (recoverResult.status) {
        case HistoryRecoverStatus.API_INACTIVE:
          break;
        case HistoryRecoverStatus.FAILED:
        case HistoryRecoverStatus.SUCCESS:
          updateData.status = recoverResult.status === HistoryRecoverStatus.SUCCESS ? ExtrinsicStatus.SUCCESS : ExtrinsicStatus.FAIL;
          this.updateHistoryByExtrinsicHash(currentExtrinsicHash, updateData).catch(console.error);
          delete this.#needRecoveryHistories[currentExtrinsicHash];
          break;
        default:
          this.updateHistoryByExtrinsicHash(currentExtrinsicHash, updateData).catch(console.error);
          delete this.#needRecoveryHistories[currentExtrinsicHash];
      }
    });

    if (!Object.keys(this.#needRecoveryHistories).length) {
      await this.stopRecoverHistories();
    }
  }

  startPromiseHandler = createPromiseHandler<void>();

  async init (): Promise<void> {
    this.status = ServiceStatus.INITIALIZING;
    await this.loadData();
    Promise.all([this.eventService.waitKeyringReady, this.eventService.waitChainReady]).then(() => {
      this.getHistories().catch(console.log);
      this.recoverProcessingHistory().catch(console.error);

      this.eventService.on('account.remove', (address) => {
        this.removeHistoryByAddress(address).catch(console.error);
      });
    }).catch(console.error);
    this.status = ServiceStatus.INITIALIZED;
  }

  async recoverProcessingHistory () {
    const histories = await this.dbService.getHistories();

    this.#needRecoveryHistories = {};

    histories.filter((history) => {
      return [ExtrinsicStatus.PROCESSING, ExtrinsicStatus.SUBMITTING].includes(history.status);
    }).forEach((history) => {
      this.#needRecoveryHistories[history.extrinsicHash] = history;
    });

    const recoverNumber = Object.keys(this.#needRecoveryHistories).length;

    if (recoverNumber > 0) {
      console.log(`Recover ${recoverNumber} processing history`);
    }

    this.startRecoverHistories().catch(console.error);
  }

  async start (): Promise<void> {
    if (this.status === ServiceStatus.STARTED) {
      return;
    }

    try {
      await Promise.all([this.eventService.waitKeyringReady, this.eventService.waitChainReady]);
      this.startPromiseHandler = createPromiseHandler<void>();
      this.status = ServiceStatus.STARTING;
      this.status = ServiceStatus.STARTED;
      this.startPromiseHandler.resolve();
    } catch (e) {
      this.startPromiseHandler.reject(e);
    }
  }

  waitForStarted () {
    return this.startPromiseHandler.promise;
  }

  stopPromiseHandler = createPromiseHandler<void>();

  async stop (): Promise<void> {
    try {
      this.stopPromiseHandler = createPromiseHandler<void>();
      this.status = ServiceStatus.STOPPING;
      await this.persistData();
      await this.stopRecoverHistories();
      this.stopPromiseHandler.resolve();
      this.status = ServiceStatus.STOPPED;
    } catch (e) {
      this.stopPromiseHandler.reject(e);
    }
  }

  waitForStopped () {
    return this.stopPromiseHandler.promise;
  }
}
