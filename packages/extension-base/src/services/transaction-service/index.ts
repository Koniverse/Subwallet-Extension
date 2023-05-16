// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EvmProviderError } from '@subwallet/extension-base/background/errors/EvmProviderError';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { AmountData, BasicTxErrorType, BasicTxWarningCode, ChainType, EvmProviderErrorType, EvmSendTransactionRequest, ExtrinsicStatus, ExtrinsicType, NotificationType, TransactionDirection, TransactionHistoryItem } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { TransactionWarning } from '@subwallet/extension-base/background/warnings/TransactionWarning';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { BalanceService } from '@subwallet/extension-base/services/balance-service';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _getChainNativeTokenBasicInfo, _getEvmChainId } from '@subwallet/extension-base/services/chain-service/utils';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { HistoryService } from '@subwallet/extension-base/services/history-service';
import NotificationService from '@subwallet/extension-base/services/notification-service/NotificationService';
import RequestService from '@subwallet/extension-base/services/request-service';
import { EXTENSION_REQUEST_URL } from '@subwallet/extension-base/services/request-service/constants';
import DatabaseService from '@subwallet/extension-base/services/storage-service/DatabaseService';
import { TRANSACTION_TIMEOUT } from '@subwallet/extension-base/services/transaction-service/constants';
import { parseTransferEventLogs, parseXcmEventLogs } from '@subwallet/extension-base/services/transaction-service/event-parser';
import { getTransactionId, isSubstrateTransaction } from '@subwallet/extension-base/services/transaction-service/helpers';
import { SWTransaction, SWTransactionInput, SWTransactionResponse, TransactionEmitter, TransactionEventMap, TransactionEventResponse, ValidateTransactionResponseInput } from '@subwallet/extension-base/services/transaction-service/types';
import { getExplorerLink, parseTransactionData } from '@subwallet/extension-base/services/transaction-service/utils';
import { Web3Transaction } from '@subwallet/extension-base/signers/types';
import { anyNumberToBN } from '@subwallet/extension-base/utils/eth';
import { parseTxAndSignature } from '@subwallet/extension-base/utils/eth/mergeTransactionAndSignature';
import { isContractAddress, parseContractInput } from '@subwallet/extension-base/utils/eth/parseTransaction';
import keyring from '@subwallet/ui-keyring';
import EventEmitter from 'eventemitter3';
import RLP, { Input } from 'rlp';
import { BehaviorSubject } from 'rxjs';
import { TransactionConfig } from 'web3-core';

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { Signer, SignerResult } from '@polkadot/api/types';
import { EventRecord } from '@polkadot/types/interfaces';
import { SignerPayloadJSON } from '@polkadot/types/types/extrinsic';
import { u8aToHex } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

export default class TransactionService {
  private readonly chainService: ChainService;
  private readonly eventService: EventService;
  private readonly databaseService: DatabaseService;
  private readonly requestService: RequestService;
  private readonly balanceService: BalanceService;
  private readonly historyService: HistoryService;
  private readonly notificationService: NotificationService;
  private readonly transactionSubject: BehaviorSubject<Record<string, SWTransaction>> = new BehaviorSubject<Record<string, SWTransaction>>({});

  private get transactions (): Record<string, SWTransaction> {
    return this.transactionSubject.getValue();
  }

  constructor (chainService: ChainService, eventService: EventService, requestService: RequestService, balanceService: BalanceService, historyService: HistoryService, notificationService: NotificationService, databaseService: DatabaseService) {
    this.chainService = chainService;
    this.eventService = eventService;
    this.requestService = requestService;
    this.balanceService = balanceService;
    this.historyService = historyService;
    this.notificationService = notificationService;
    this.databaseService = databaseService;
  }

  private get allTransactions (): SWTransaction[] {
    return Object.values(this.transactions);
  }

  private get processingTransactions (): SWTransaction[] {
    return this.allTransactions.filter((t) => t.status === ExtrinsicStatus.QUEUED || t.status === ExtrinsicStatus.PROCESSING);
  }

  public getTransaction (id: string) {
    return this.transactions[id];
  }

  private checkDuplicate (transaction: ValidateTransactionResponseInput): TransactionError[] {
    // Check duplicated transaction
    const existed = this.processingTransactions
      .filter((item) => item.address === transaction.address && item.chain === transaction.chain);

    if (existed.length > 0) {
      return [new TransactionError(BasicTxErrorType.DUPLICATE_TRANSACTION)];
    }

    return [];
  }

  public async generalValidate (validationInput: SWTransactionInput): Promise<SWTransactionResponse> {
    const validation = {
      ...validationInput,
      errors: validationInput.errors || [],
      warnings: validationInput.warnings || []
    };
    const { additionalValidator, address, chain, edAsWarning, isTransferAll, transaction } = validation;

    // Check duplicate transaction
    validation.errors.push(...this.checkDuplicate(validationInput));

    // Return unsupported error if not found transaction
    if (!transaction) {
      validation.errors.push(new TransactionError(BasicTxErrorType.UNSUPPORTED));
    }

    const validationResponse: SWTransactionResponse = {
      status: undefined,
      ...validation
    };

    // Estimate fee
    const estimateFee: AmountData = {
      symbol: '',
      decimals: 0,
      value: ''
    };

    const chainInfo = this.chainService.getChainInfoByKey(chain);

    if (!chainInfo) {
      validationResponse.errors.push(new TransactionError(BasicTxErrorType.INTERNAL_ERROR, "Can't find network"));
    } else {
      const { decimals, symbol } = _getChainNativeTokenBasicInfo(chainInfo);

      estimateFee.decimals = decimals;
      estimateFee.symbol = symbol;

      if (transaction) {
        try {
          if (isSubstrateTransaction(transaction)) {
            estimateFee.value = (await transaction.paymentInfo(address)).partialFee.toString();
          } else {
            const web3 = this.chainService.getEvmApi(chain);

            if (!web3) {
              validationResponse.errors.push(new TransactionError(BasicTxErrorType.CHAIN_DISCONNECTED));
            } else {
              const gasPrice = await web3.api.eth.getGasPrice();
              const gasLimit = await web3.api.eth.estimateGas(transaction);

              estimateFee.value = (gasLimit * parseInt(gasPrice)).toString();
            }
          }
        } catch (e) {
          estimateFee.value = '0';
        }
      }
    }

    validationResponse.estimateFee = estimateFee;

    // Read-only account
    const pair = keyring.getPair(address);

    if (!pair) {
      validationResponse.errors.push(new TransactionError(BasicTxErrorType.INTERNAL_ERROR, 'Can\'t find account'));
    } else {
      if (pair.meta?.isReadOnly) {
        validationResponse.errors.push(new TransactionError(BasicTxErrorType.INTERNAL_ERROR, 'This is read-only account'));
      }
    }

    // Balance
    const transferNative = validationResponse.transferNativeAmount || '0';
    const nativeTokenInfo = this.chainService.getNativeTokenInfo(chain);

    const balance = await this.balanceService.getTokenFreeBalance(address, chain, nativeTokenInfo.slug);

    const existentialDeposit = nativeTokenInfo.minAmount || '0';

    const feeNum = parseInt(estimateFee.value);
    const balanceNum = parseInt(balance.value);
    const edNum = parseInt(existentialDeposit);
    const transferNativeNum = parseInt(transferNative);

    if (!isTransferAll) {
      if (transferNativeNum + feeNum > balanceNum) {
        validationResponse.errors.push(new TransactionError(BasicTxErrorType.NOT_ENOUGH_BALANCE));
      } else {
        if (balanceNum - (transferNativeNum + feeNum) <= edNum) {
          if (edAsWarning) {
            validationResponse.warnings.push(new TransactionWarning(BasicTxWarningCode.NOT_ENOUGH_EXISTENTIAL_DEPOSIT, ''));
          } else {
            validationResponse.errors.push(new TransactionError(BasicTxErrorType.NOT_ENOUGH_EXISTENTIAL_DEPOSIT, ''));
          }
        }
      }
    }

    // Validate transaction with additionalValidator method
    additionalValidator && await additionalValidator(validationResponse);

    return validationResponse;
  }

  public getTransactionSubject () {
    return this.transactionSubject;
  }

  private fillTransactionDefaultInfo (transaction: SWTransactionInput): SWTransaction {
    const isInternal = !transaction.url;
    const transactionId = getTransactionId(transaction.chainType, transaction.chain, isInternal);

    return {
      ...transaction,
      createdAt: new Date(),
      updatedAt: new Date(),
      errors: transaction.errors || [],
      warnings: transaction.warnings || [],
      url: transaction.url || EXTENSION_REQUEST_URL,
      status: ExtrinsicStatus.QUEUED,
      isInternal,
      id: transactionId,
      extrinsicHash: transactionId
    } as SWTransaction;
  }

  public async addTransaction (inputTransaction: SWTransactionInput): Promise<TransactionEmitter> {
    const transactions = this.transactions;
    // Fill transaction default info
    const transaction = this.fillTransactionDefaultInfo(inputTransaction);

    // Add Transaction
    transactions[transaction.id] = transaction;
    this.transactionSubject.next({ ...transactions });

    return await this.sendTransaction(transaction);
  }

  public generateBeforeHandleResponseErrors (errors: TransactionError[]): SWTransactionResponse {
    return {
      errors,
      additionalValidator: undefined,
      address: '',
      chain: '',
      chainType: ChainType.SUBSTRATE,
      data: undefined,
      extrinsicType: ExtrinsicType.UNKNOWN,
      transferNativeAmount: undefined,
      url: undefined,
      warnings: []
    };
  }

  public async handleTransaction (transaction: SWTransactionInput): Promise<SWTransactionResponse> {
    const validatedTransaction = await this.generalValidate(transaction);
    const stopByErrors = validatedTransaction.errors.length > 0;
    const stopByWarnings = validatedTransaction.warnings.length > 0 && !validatedTransaction.ignoreWarnings;

    if (stopByErrors || stopByWarnings) {
      return validatedTransaction;
    }

    validatedTransaction.warnings = [];

    const emitter = await this.addTransaction(validatedTransaction);

    await new Promise<void>((resolve) => {
      emitter.on('signed', (data: TransactionEventResponse) => {
        validatedTransaction.id = data.id;
        validatedTransaction.extrinsicHash = data.extrinsicHash;
        resolve();
      });

      emitter.on('error', (data: TransactionEventResponse) => {
        if (data.errors.length > 0) {
          validatedTransaction.errors.push(...data.errors);
          resolve();
        }
      });
    });

    return validatedTransaction;
  }

  private async sendTransaction (transaction: SWTransaction): Promise<TransactionEmitter> {
    // Send Transaction
    const emitter = transaction.chainType === 'substrate' ? this.signAndSendSubstrateTransaction(transaction) : (await this.signAndSendEvmTransaction(transaction));

    emitter.on('signed', (data: TransactionEventResponse) => {
      this.onSigned(data);
    });

    emitter.on('send', (data: TransactionEventResponse) => {
      this.onSend(data);
    });

    emitter.on('extrinsicHash', (data: TransactionEventResponse) => {
      this.onHasTransactionHash(data);
    });

    emitter.on('success', (data: TransactionEventResponse) => {
      this.handlePostProcessing(data.id);
      this.onSuccess(data);
    });

    emitter.on('error', (data: TransactionEventResponse) => {
      // this.handlePostProcessing(data.id); // might enable this later
      this.onFailed({ ...data, errors: [...data.errors, new TransactionError(BasicTxErrorType.INTERNAL_ERROR)] });
    });

    // Todo: handle any event with transaction.eventsHandler

    return emitter;
  }

  private removeTransaction (id: string): void {
    if (this.transactions[id]) {
      delete this.transactions[id];
      this.transactionSubject.next({ ...this.transactions });
    }
  }

  private updateTransaction (id: string, data: Partial<Omit<SWTransaction, 'id'>>): void {
    const transaction = this.transactions[id];

    if (transaction) {
      this.transactions[id] = {
        ...transaction,
        ...data
      };
    }
  }

  private getTransactionLink (id: string): string | undefined {
    const transaction = this.getTransaction(id);
    const chainInfo = this.chainService.getChainInfoByKey(transaction.chain);

    return getExplorerLink(chainInfo, transaction.extrinsicHash, 'tx');
  }

  private transactionToHistories (id: string, eventLogs?: EventRecord[]): TransactionHistoryItem[] {
    const transaction = this.getTransaction(id);
    const historyItem: TransactionHistoryItem = {
      origin: 'app',
      chain: transaction.chain,
      direction: TransactionDirection.SEND,
      type: transaction.extrinsicType,
      from: transaction.address,
      to: '',
      chainType: transaction.chainType,
      address: transaction.address,
      status: transaction.status,
      transactionId: transaction.id,
      extrinsicHash: transaction.extrinsicHash,
      time: transaction.createdAt.getTime(),
      fee: transaction.estimateFee,
      blockNumber: 0, // Will be added in next step
      blockHash: '' // Will be added in next step
    };

    const chainInfo = this.chainService.getChainInfoByKey(transaction.chain);
    const nativeAsset = _getChainNativeTokenBasicInfo(chainInfo);
    const baseNativeAmount = { value: '0', decimals: nativeAsset.decimals, symbol: nativeAsset.symbol };

    // Fill data by extrinsicType
    switch (transaction.extrinsicType) {
      case ExtrinsicType.TRANSFER_BALANCE: {
        const inputData = parseTransactionData<ExtrinsicType.TRANSFER_TOKEN>(transaction.data);

        historyItem.to = inputData.to;
        const sendingTokenInfo = this.chainService.getAssetBySlug(inputData.tokenSlug);

        historyItem.amount = { value: inputData.value || '0', decimals: sendingTokenInfo.decimals || 0, symbol: sendingTokenInfo.symbol };
        eventLogs && parseTransferEventLogs(historyItem, eventLogs, transaction.chain, sendingTokenInfo, chainInfo);
      }

        break;
      case ExtrinsicType.TRANSFER_TOKEN: {
        const inputData = parseTransactionData<ExtrinsicType.TRANSFER_TOKEN>(transaction.data);

        historyItem.to = inputData.to;
        const sendingTokenInfo = this.chainService.getAssetBySlug(inputData.tokenSlug);

        historyItem.amount = { value: inputData.value || '0', decimals: sendingTokenInfo.decimals || 0, symbol: sendingTokenInfo.symbol };
        eventLogs && parseTransferEventLogs(historyItem, eventLogs, transaction.chain, sendingTokenInfo, chainInfo);
      }

        break;
      case ExtrinsicType.TRANSFER_XCM: {
        const inputData = parseTransactionData<ExtrinsicType.TRANSFER_XCM>(transaction.data);

        historyItem.to = inputData.to;
        const sendingTokenInfo = this.chainService.getAssetBySlug(inputData.tokenSlug);

        historyItem.amount = { value: inputData.value || '0', decimals: sendingTokenInfo.decimals || 0, symbol: sendingTokenInfo.symbol };

        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        historyItem.additionalInfo = { destinationChain: inputData?.destinationNetworkKey || '' };
        eventLogs && parseXcmEventLogs(historyItem, eventLogs, transaction.chain, sendingTokenInfo, chainInfo);
      }

        break;
      case ExtrinsicType.SEND_NFT: {
        const inputData = parseTransactionData<ExtrinsicType.SEND_NFT>(transaction.data);

        historyItem.to = inputData.recipientAddress;
        historyItem.amount = {
          decimals: 0,
          symbol: 'NFT',
          value: '1'
        };
      }

        break;
      case ExtrinsicType.STAKING_BOND: {
        const data = parseTransactionData<ExtrinsicType.STAKING_BOND>(transaction.data);

        historyItem.amount = { ...baseNativeAmount, value: data.amount || '0' };
      }

        break;
      case ExtrinsicType.STAKING_JOIN_POOL: {
        const data = parseTransactionData<ExtrinsicType.STAKING_JOIN_POOL>(transaction.data);

        historyItem.amount = { ...baseNativeAmount, value: data.amount || '0' };
        historyItem.to = data.selectedPool.name || data.selectedPool.id.toString();
      }

        break;
      case ExtrinsicType.STAKING_UNBOND:
        {
          const data = parseTransactionData<ExtrinsicType.STAKING_UNBOND>(transaction.data);

          historyItem.to = data.validatorAddress || '';
          historyItem.amount = { ...baseNativeAmount, value: data.amount || '0' };
        }

        break;
      case ExtrinsicType.STAKING_LEAVE_POOL:
        {
          const data = parseTransactionData<ExtrinsicType.STAKING_LEAVE_POOL>(transaction.data);

          historyItem.to = data.nominatorMetadata.address || '';
          historyItem.amount = { ...baseNativeAmount, value: data.amount || '0' };
        }

        break;
      case ExtrinsicType.STAKING_CLAIM_REWARD: {
        const data = parseTransactionData<ExtrinsicType.STAKING_CLAIM_REWARD>(transaction.data);

        historyItem.amount = { ...baseNativeAmount, value: data.unclaimedReward || '0' };
      }

        break;

      case ExtrinsicType.STAKING_WITHDRAW: {
        const data = parseTransactionData<ExtrinsicType.STAKING_WITHDRAW>(transaction.data);

        historyItem.to = data.validatorAddress || '';
        historyItem.amount = { ...baseNativeAmount, value: data.unstakingInfo.claimable || '0' };
        break;
      }

      case ExtrinsicType.STAKING_CANCEL_UNSTAKE: {
        const data = parseTransactionData<ExtrinsicType.STAKING_CANCEL_UNSTAKE>(transaction.data);

        historyItem.amount = { ...baseNativeAmount, value: data.selectedUnstaking.claimable || '0' };
        break;
      }

      case ExtrinsicType.EVM_EXECUTE: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = parseTransactionData<ExtrinsicType.EVM_EXECUTE>(transaction.data);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        historyItem.to = data?.to || '';
        break;
      }

      case ExtrinsicType.UNKNOWN:
        break;
    }

    try {
      // Return one more history record if transaction send to account in the wallets
      const toAccount = historyItem?.to && keyring.getPair(historyItem.to);

      if (toAccount) {
        return [historyItem, { ...historyItem, address: toAccount.address, direction: TransactionDirection.RECEIVED }];
      }
    } catch (e) {
      console.warn(e);
    }

    return [historyItem];
  }

  private onSigned ({ id }: TransactionEventResponse) {
    console.log(`Transaction "${id}" is signed`);
  }

  private onSend ({ id }: TransactionEventResponse) {
    // Update transaction status
    this.updateTransaction(id, { status: ExtrinsicStatus.SUBMITTING });

    // Create Input History Transaction History
    this.historyService.insertHistories(this.transactionToHistories(id)).catch(console.error);

    console.log(`Transaction "${id}" is sent`);
  }

  private onHasTransactionHash ({ extrinsicHash, id }: TransactionEventResponse) {
    // Write processing transaction history
    const updateData = { extrinsicHash, status: ExtrinsicStatus.PROCESSING };

    this.updateTransaction(id, updateData);

    // In this case transaction id is the same as extrinsic hash and will change after below update
    this.historyService.updateHistoryByExtrinsicHash(id, updateData).catch(console.error);

    console.log(`Transaction "${id}" is submitted with hash ${extrinsicHash || ''}`);
  }

  private handlePostProcessing (id: string) { // must be done after success/failure to make sure the transaction is finalized
    const transaction = this.getTransaction(id);

    if (transaction.extrinsicType === ExtrinsicType.SEND_NFT) {
      const inputData = parseTransactionData<ExtrinsicType.SEND_NFT>(transaction.data);

      try {
        const sender = keyring.getPair(inputData.senderAddress);

        sender && this.databaseService.handleNftTransfer(transaction.chain, [sender.address, ALL_ACCOUNT_KEY], inputData.nftItem)
          .then(() => {
            this.eventService.emit('transaction.transferNft', undefined);
          })
          .catch(console.error);
      } catch (e) {
        console.error(e);
      }

      try {
        const recipient = keyring.getPair(inputData.recipientAddress);

        recipient && this.databaseService.addNft(recipient.address, { ...inputData.nftItem, owner: recipient.address })
          .catch(console.error);
      } catch (e) {
        console.error(e);
      }
    } else if ([ExtrinsicType.STAKING_BOND, ExtrinsicType.STAKING_UNBOND, ExtrinsicType.STAKING_WITHDRAW, ExtrinsicType.STAKING_CANCEL_UNSTAKE, ExtrinsicType.STAKING_CLAIM_REWARD, ExtrinsicType.STAKING_JOIN_POOL, ExtrinsicType.STAKING_POOL_WITHDRAW, ExtrinsicType.STAKING_LEAVE_POOL].includes(transaction.extrinsicType)) {
      this.eventService.emit('transaction.submitStaking', transaction.chain);
    }
  }

  private onSuccess ({ blockHash, blockNumber, id }: TransactionEventResponse) {
    const transaction = this.getTransaction(id);

    this.updateTransaction(id, { status: ExtrinsicStatus.SUCCESS });

    // Write success transaction history
    this.historyService.updateHistories(transaction.chain, transaction.extrinsicHash, {
      status: ExtrinsicStatus.SUCCESS,
      blockNumber: blockNumber || 0,
      blockHash: blockHash || ''
    }).catch(console.error);

    this.notificationService.notify({
      type: NotificationType.SUCCESS,
      title: 'Transaction completed',
      message: `Transaction ${transaction?.extrinsicHash} completed`,
      action: { url: this.getTransactionLink(id) },
      notifyViaBrowser: true
    });

    this.eventService.emit('transaction.done', transaction);
  }

  private onFailed ({ blockHash, blockNumber, errors, id }: TransactionEventResponse) {
    const transaction = this.getTransaction(id);
    const nextStatus = ExtrinsicStatus.FAIL;

    if (transaction) {
      this.updateTransaction(id, { status: nextStatus, errors });

      // Write failed transaction history
      this.historyService.updateHistories(transaction.chain, transaction.extrinsicHash, {
        status: nextStatus,
        blockNumber: blockNumber || 0,
        blockHash: blockHash || ''
      }).catch(console.error);

      this.notificationService.notify({
        type: NotificationType.ERROR,
        title: 'Transaction failed',
        message: `Transaction ${transaction?.extrinsicHash} failed`,
        action: { url: this.getTransactionLink(id) },
        notifyViaBrowser: true
      });
    }

    this.eventService.emit('transaction.failed', transaction);
  }

  public generateHashPayload (chain: string, transaction: TransactionConfig): HexString {
    const chainInfo = this.chainService.getChainInfoByKey(chain);

    const txObject: Web3Transaction = {
      nonce: transaction.nonce || 1,
      from: transaction.from as string,
      gasPrice: anyNumberToBN(transaction.gasPrice).toNumber(),
      gasLimit: anyNumberToBN(transaction.gas).toNumber(),
      to: transaction.to !== undefined ? transaction.to : '',
      value: anyNumberToBN(transaction.value).toNumber(),
      data: transaction.data ? transaction.data : '',
      chainId: _getEvmChainId(chainInfo)
    };

    const data: Input = [
      txObject.nonce,
      txObject.gasPrice,
      txObject.gasLimit,
      txObject.to,
      txObject.value,
      txObject.data,
      txObject.chainId,
      new Uint8Array([0x00]),
      new Uint8Array([0x00])
    ];

    const encoded = RLP.encode(data);

    return u8aToHex(encoded);
  }

  private async signAndSendEvmTransaction ({ address,
    chain,
    id,
    transaction,
    url }: SWTransaction): Promise<TransactionEmitter> {
    const payload = (transaction as EvmSendTransactionRequest);
    const evmApi = this.chainService.getEvmApi(chain);
    const chainInfo = this.chainService.getChainInfoByKey(chain);

    const accountPair = keyring.getPair(address);
    const account: AccountJson = { address, ...accountPair.meta };

    if (!payload.account) {
      payload.account = account;
    }

    // Allow sign transaction
    payload.canSign = true;

    // Fill contract info
    if (!payload.parseData) {
      const isToContract = await isContractAddress(payload.to || '', evmApi);

      payload.isToContract = isToContract;
      payload.parseData = isToContract
        ? payload.data
          ? (await parseContractInput(payload.data || '', payload.to || '', chainInfo)).result
          : ''
        : payload.data || '';
    }

    if ('data' in payload && payload.data === undefined) {
      delete payload.data;
    }

    // Set unique nonce to avoid transaction errors
    if (!payload.nonce) {
      const evmApi = this.chainService.getEvmApi(chain);

      payload.nonce = await evmApi.api.eth.getTransactionCount(address);
    }

    if (!payload.chainId) {
      payload.chainId = chainInfo.evmInfo?.evmChainId ?? 1;
    }

    // Autofill from
    if (!payload.from) {
      payload.from = address;
    }

    const isExternal = !!account.isExternal;

    // generate hashPayload for EVM transaction
    payload.hashPayload = this.generateHashPayload(chain, payload);

    const emitter = new EventEmitter<TransactionEventMap>();

    const txObject: Web3Transaction = {
      nonce: payload.nonce || 1,
      from: payload.from as string,
      gasPrice: anyNumberToBN(payload.gasPrice).toNumber(),
      gasLimit: anyNumberToBN(payload.gas).toNumber(),
      to: payload.to !== undefined ? payload.to : '',
      value: anyNumberToBN(payload.value).toNumber(),
      data: payload.data ? payload.data : '',
      chainId: payload.chainId
    };

    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: []
    };

    this.requestService.addConfirmation(id, url || EXTENSION_REQUEST_URL, 'evmSendTransactionRequest', payload, {})
      .then(({ isApproved, payload }) => {
        if (isApproved) {
          let signedTransaction: string | undefined;

          if (!payload) {
            throw new EvmProviderError(EvmProviderErrorType.UNAUTHORIZED, 'Bad signature');
          }

          const web3Api = this.chainService.getEvmApi(chain).api;

          if (!isExternal) {
            signedTransaction = payload;
          } else {
            const signed = parseTxAndSignature(txObject, payload as `0x${string}`);

            const recover = web3Api.eth.accounts.recoverTransaction(signed);

            if (recover.toLowerCase() !== account.address.toLowerCase()) {
              throw new EvmProviderError(EvmProviderErrorType.UNAUTHORIZED, 'Bad signature');
            }

            signedTransaction = signed;
          }

          // Emit signed event
          emitter.emit('signed', eventData);

          // Send transaction
          this.handleTransactionTimeout(emitter, eventData);
          emitter.emit('send', eventData); // This event is needed after sending transaction with queue
          signedTransaction && web3Api.eth.sendSignedTransaction(signedTransaction)
            .once('transactionHash', (hash) => {
              eventData.extrinsicHash = hash;
              emitter.emit('extrinsicHash', eventData);
            })
            .once('receipt', (rs) => {
              eventData.blockHash = rs.blockHash;
              eventData.blockNumber = rs.blockNumber;
              emitter.emit('success', eventData);
            })
            .once('error', (e) => {
              eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, e.message));
              emitter.emit('error', eventData);
            })
            .catch((e: Error) => {
              eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SEND, e.message));
              emitter.emit('error', eventData);
            });
        } else {
          this.removeTransaction(id);
          eventData.errors.push(new TransactionError(BasicTxErrorType.USER_REJECT_REQUEST));
          emitter.emit('error', eventData);
        }
      })
      .catch((e: Error) => {
        this.removeTransaction(id);
        eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, e.message));

        emitter.emit('error', eventData);
      });

    return emitter;
  }

  private signAndSendSubstrateTransaction ({ address, id, transaction, url }: SWTransaction): TransactionEmitter {
    const emitter = new EventEmitter<TransactionEventMap>();
    const eventData: TransactionEventResponse = {
      id,
      errors: [],
      warnings: []
    };

    (transaction as SubmittableExtrinsic).signAsync(address, {
      signer: {
        signPayload: async (payload: SignerPayloadJSON) => {
          const signing = await this.requestService.signInternalTransaction(id, address, url || EXTENSION_REQUEST_URL, payload);

          return {
            id: (new Date()).getTime(),
            signature: signing.signature
          } as SignerResult;
        }
      } as Signer
    }).then((rs) => {
      // Emit signed event
      emitter.emit('signed', eventData);

      // Send transaction
      this.handleTransactionTimeout(emitter, eventData);
      emitter.emit('send', eventData); // This event is needed after sending transaction with queue

      rs.send((txState) => {
        // handle events, logs, history
        if (!txState || !txState.status) {
          return;
        }

        if (txState.status.isInBlock) {
          eventData.eventLogs = txState.events;

          if (!eventData.extrinsicHash || eventData.extrinsicHash === '') {
            eventData.extrinsicHash = txState.txHash.toHex();
            emitter.emit('extrinsicHash', eventData);
          }
        }

        if (txState.status.isFinalized) {
          eventData.eventLogs = txState.events;
          // TODO: push block hash and block number into eventData
          txState.events
            .filter(({ event: { section } }) => section === 'system')
            .forEach(({ event: { method, data: [error] } }): void => {
              if (method === 'ExtrinsicFailed') {
                eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, error.toString()));
                emitter.emit('error', eventData);
              } else if (method === 'ExtrinsicSuccess') {
                emitter.emit('success', eventData);
              }
            });
        }
      }).catch((e: Error) => {
        eventData.errors.push(new TransactionError(BasicTxErrorType.SEND_TRANSACTION_FAILED, e.message));
        emitter.emit('error', eventData);
      });
    }).catch((e: Error) => {
      this.removeTransaction(id);
      eventData.errors.push(new TransactionError(BasicTxErrorType.UNABLE_TO_SIGN, e.message));
      emitter.emit('error', eventData);
    });

    return emitter;
  }

  private handleTransactionTimeout (emitter: EventEmitter<TransactionEventMap>, eventData: TransactionEventResponse): void {
    const timeout = setTimeout(() => {
      const transaction = this.getTransaction(eventData.id);

      if (transaction.status !== ExtrinsicStatus.SUCCESS && transaction.status !== ExtrinsicStatus.FAIL) {
        eventData.errors.push(new TransactionError(BasicTxErrorType.TIMEOUT, 'Transaction timeout'));
        emitter.emit('error', eventData);
        clearTimeout(timeout);
      }
    }, TRANSACTION_TIMEOUT);

    emitter.once('success', () => {
      clearTimeout(timeout);
    });

    emitter.once('error', () => {
      clearTimeout(timeout);
    });
  }

  public resetWallet (): void {
    this.transactionSubject.next({});
  }
}
