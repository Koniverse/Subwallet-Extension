// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WALLET_CONNECT_EIP155_NAMESPACE, WALLET_CONNECT_POLKADOT_NAMESPACE } from '@subwallet/extension-base/services/wallet-connect-service/constants';
import { WalletConnectSessionRequest } from '@subwallet/extension-base/services/wallet-connect-service/types';
import { AddNetworkWCModal, AlertBox, ConfirmationGeneralInfo, WCAccountSelect, WCNetworkSelected, WCNetworkSupported } from '@subwallet/extension-koni-ui/components';
import { ADD_NETWORK_WALLET_CONNECT_MODAL, TIME_OUT_RECORD } from '@subwallet/extension-koni-ui/constants';
import { useNotification, useSelectWalletConnectAccount, useSetSelectedAccountTypes } from '@subwallet/extension-koni-ui/hooks';
import { approveWalletConnectSession, rejectWalletConnectSession } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { convertKeyTypes, detectChanInfo, isAccountAll } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, PlusCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface Props extends ThemeProps {
  request: WalletConnectSessionRequest
}

async function handleConfirm ({ id }: WalletConnectSessionRequest, selectedAccounts: string[]) {
  return await approveWalletConnectSession({
    id,
    accounts: selectedAccounts.filter((item) => !isAccountAll(item))
  });
}

async function handleCancel ({ id }: WalletConnectSessionRequest) {
  return await rejectWalletConnectSession({
    id
  });
}

const timeOutWCMissingKey = 'unsuccessful_connect_wc_modal';
const wcMissingModalId = 'WALLET_CONNECT_CONFIRM_MODAL';

function Component ({ className, request }: Props) {
  const { params } = request.request;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const setSelectedAccountTypes = useSetSelectedAccountTypes(true);
  const [blockAddNetwork, setBlockAddNetwork] = useState(false);
  const [networkNeedToImport, setNetworkNeedToImport] = useState<string[]>([]);

  const nameSpaceNameMap = useMemo((): Record<string, string> => ({
    [WALLET_CONNECT_EIP155_NAMESPACE]: t('EVM networks'),
    [WALLET_CONNECT_POLKADOT_NAMESPACE]: t('Substrate networks')
  }), [t]);
  const { activeModal, inactiveModal } = useContext(ModalContext);

  useEffect(() => {
    const timeOut = JSON.parse(localStorage.getItem(TIME_OUT_RECORD) || '{}') as Record<string, number>;

    inactiveModal(wcMissingModalId);
    clearTimeout(timeOut[timeOutWCMissingKey]);
    delete timeOut[timeOutWCMissingKey];
    localStorage.setItem(TIME_OUT_RECORD, JSON.stringify(timeOut));
  }, [inactiveModal]);

  const { isExitedAnotherUnsupportedNamespace,
    isExpired,
    isUnSupportCase,
    missingType,
    namespaceAccounts,
    noNetwork,
    onApplyAccounts,
    onCancelSelectAccounts,
    onSelectAccount,
    supportOneChain,
    supportOneNamespace,
    supportedChains } = useSelectWalletConnectAccount(params);

  const allowSubmit = useMemo(() => {
    return Object.values(namespaceAccounts).every(({ appliedAccounts }) => appliedAccounts.length);
  }, [namespaceAccounts]);

  const checkNetworksConnected = useMemo((): string[] => {
    let needConnectedNetwork: string[] = [];

    Object.values(namespaceAccounts).forEach((value) => {
      const { networks } = value;
      const [unsupportedNetworks, supportedNetworks] = networks.reduce<[string[], string[]]>(([unsupportedNetworks_, supportedNetworks_], { slug, supported }) => {
        if (supported) {
          supportedNetworks_.push(slug);
        } else {
          const chainData = slug.split(':');

          if (chainData.length > 1) {
            const [namespace, chainId] = chainData;

            if (namespace === WALLET_CONNECT_EIP155_NAMESPACE) {
              unsupportedNetworks_.push(chainId);
            } else if (namespace === WALLET_CONNECT_POLKADOT_NAMESPACE) {
              setBlockAddNetwork(true);
            }
          }
        }

        return [unsupportedNetworks_, supportedNetworks_];
      }, [[], []]);

      // When the network to be imported is a required network, only one network import is allowed.
      if (isUnSupportCase && unsupportedNetworks.length === 1) {
        needConnectedNetwork = [...unsupportedNetworks];
      } else if (!isUnSupportCase && supportedNetworks.length === 0) {
        // When networks to be imported are optional networks, and only allow the import if there is no network required by the Dapp that the extension supports.
        needConnectedNetwork = [...unsupportedNetworks];
      }
    });

    return needConnectedNetwork;
  }, [isUnSupportCase, namespaceAccounts]);
  const [loading, setLoading] = useState(false);

  const _onSelectAccount = useCallback((namespace: string): ((address: string, applyImmediately?: boolean) => VoidFunction) => {
    return (address: string, applyImmediately = false) => {
      return () => {
        onSelectAccount(namespace, address, applyImmediately)();
      };
    };
  }, [onSelectAccount]);

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(request).finally(() => {
      navigate('/wallet-connect/list');
      setLoading(false);
    });
  }, [navigate, request]);

  const onConfirm = useCallback(() => {
    setLoading(true);
    const selectedAccounts = Object.values(namespaceAccounts).map(({ appliedAccounts }) => appliedAccounts).flat();

    handleConfirm(request, selectedAccounts)
      .catch((e) => {
        notification({
          type: 'error',
          message: (e as Error).message,
          duration: 1.5
        });
      })
      .finally(() => {
        navigate('/wallet-connect/list');
        setLoading(false);
      });
  }, [namespaceAccounts, navigate, notification, request]);

  const onAddAccount = useCallback(() => {
    setSelectedAccountTypes(convertKeyTypes(missingType));
    setLoading(true);
    navigate('/accounts/new-seed-phrase', { state: { useGoBack: true } });
  }, [setSelectedAccountTypes, missingType, navigate]);

  const onApplyModal = useCallback((namespace: string) => {
    return () => {
      onApplyAccounts(namespace);
    };
  }, [onApplyAccounts]);

  const onCancelModal = useCallback((namespace: string) => {
    return () => {
      onCancelSelectAccounts(namespace);
    };
  }, [onCancelSelectAccounts]);

  const isSupportCase = !isUnSupportCase && !isExpired && !noNetwork;

  useEffect(() => {
    if (checkNetworksConnected.length > 0 && !blockAddNetwork && !isExitedAnotherUnsupportedNamespace) {
      detectChanInfo(checkNetworksConnected).then((rs) => {
        if (rs) {
          setNetworkNeedToImport([rs]);
          activeModal(ADD_NETWORK_WALLET_CONNECT_MODAL);
        } else {
          setBlockAddNetwork(true);
        }
      }).catch(() => {
        setBlockAddNetwork(true);
      });
    }
  }, [activeModal, blockAddNetwork, checkNetworksConnected, isExitedAnotherUnsupportedNamespace]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        {
          (isUnSupportCase || blockAddNetwork) && (
            <>
              <AlertBox
                description={t('There is at least 1 chosen network unavailable')}
                title={t('Unsupported network')}
                type='warning'
              />
              <WCNetworkSupported
                id='support-networks'
                networks={supportedChains}
              />
            </>
          )
        }
        {
          noNetwork && (
            (
              <AlertBox
                description={t('We are unable to detect any network from the dApp through WalletConnect')}
                title={t('Network undetected')}
                type='warning'
              />
            )
          )
        }
        {
          !isUnSupportCase && !noNetwork && isExpired && (
            <>
              <AlertBox
                description={t('Connection expired. Please create a new connection from dApp')}
                title={t('Connection expired')}
                type='warning'
              />
            </>
          )
        }
        {
          isSupportCase && !blockAddNetwork && (
            <div className='namespaces-list'>
              {
                Object.entries(namespaceAccounts).map(([namespace, value]) => {
                  const { appliedAccounts, availableAccounts, networks, selectedAccounts } = value;

                  return (
                    <div
                      className={CN('namespace-container', { 'space-xs': !supportOneNamespace })}
                      key={namespace}
                    >
                      {!supportOneChain && (
                        <>
                          <div className='namespace-title'>
                            {supportOneNamespace ? t('Networks') : nameSpaceNameMap[namespace]}
                          </div>
                          <WCNetworkSelected
                            id={`${namespace}-networks`}
                            networks={networks}
                          />
                        </>
                      )}
                      {
                        supportOneNamespace && (
                          <div className='account-list-title'>
                            {t('Choose the account(s) you’d like to connect')}
                          </div>
                        )
                      }
                      <WCAccountSelect
                        appliedAccounts={appliedAccounts}
                        availableAccounts={availableAccounts}
                        id={`${namespace}-accounts`}
                        namespace={namespace}
                        onApply={onApplyModal(namespace)}
                        onCancel={onCancelModal(namespace)}
                        onSelectAccount={_onSelectAccount(namespace)}
                        selectedAccounts={selectedAccounts}
                        useModal={!supportOneNamespace}
                      />
                    </div>
                  );
                })
              }
            </div>
          )
        }
      </div>
      <div className='confirmation-footer'>
        {
          !isSupportCase && (
            <Button
              disabled={loading}
              icon={(
                <Icon
                  phosphorIcon={XCircle}
                  weight='fill'
                />
              )}
              onClick={onCancel}
              schema={'secondary'}
            >
              {t('common.Button.cancel')}
            </Button>
          )
        }
        {
          isSupportCase && !missingType.length &&
          (
            <>
              <Button
                disabled={loading}
                icon={(
                  <Icon
                    phosphorIcon={XCircle}
                    weight='fill'
                  />
                )}
                onClick={onCancel}
                schema={'secondary'}
              >
                {t('common.Button.cancel')}
              </Button>
              <Button
                disabled={!allowSubmit}
                icon={(
                  <Icon
                    phosphorIcon={CheckCircle}
                    weight='fill'
                  />
                )}
                loading={loading}
                onClick={onConfirm}
              >
                {t('Approve')}
              </Button>
            </>
          )
        }
        {
          isSupportCase && !!missingType.length &&
            (
              <>
                <Button
                  disabled={loading}
                  icon={(
                    <Icon
                      phosphorIcon={XCircle}
                      weight='fill'
                    />
                  )}
                  onClick={onCancel}
                  schema={'secondary'}
                >
                  {t('common.Button.cancel')}
                </Button>
                <Button
                  disabled={loading}
                  icon={(
                    <Icon
                      phosphorIcon={PlusCircle}
                      weight='fill'
                    />
                  )}
                  onClick={onAddAccount}
                >
                  {t('Create one')}
                </Button>
              </>
            )
        }
      </div>
      <AddNetworkWCModal
        cancelRequest={onCancel}
        networkToAdd={networkNeedToImport}
      />
    </>
  );
}

const ConnectWalletConnectConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '--content-gap': `${token.size}px`,

  '.account-list-title': {
    fontSize: token.fontSizeHeading6,
    lineHeight: token.lineHeightHeading6,
    fontWeight: token.fontWeightStrong,
    textAlign: 'start'
  },

  '.namespaces-list': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.size
  },

  '.namespace-container': {
    display: 'flex',
    flexDirection: 'column',
    gap: token.size,

    '&.space-xs': {
      gap: token.sizeXS
    }
  },

  '.namespace-title': {
    fontSize: '11px',
    fontWeight: token.fontWeightStrong,
    lineHeight: '20px',
    textTransform: 'uppercase',
    textAlign: 'left',
    color: token.colorTextSecondary
  }
}));

export default ConnectWalletConnectConfirmation;
