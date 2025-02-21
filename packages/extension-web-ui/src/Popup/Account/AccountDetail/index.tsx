// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountActions, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { AccountProxyTypeTag, CloseIcon, InstructionContainer, InstructionContentType, Layout, PageWrapper } from '@subwallet/extension-web-ui/components';
import { FilterTabItemType, FilterTabs } from '@subwallet/extension-web-ui/components/FilterTabs';
import { ACCOUNT_EXPORT_MODAL } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { WalletModalContext } from '@subwallet/extension-web-ui/contexts/WalletModalContextProvider';
import { useDefaultNavigate, useGetAccountProxyById, useNotification } from '@subwallet/extension-web-ui/hooks';
import { editAccount, forgetAccount, validateAccountName } from '@subwallet/extension-web-ui/messaging';
import AccountExport from '@subwallet/extension-web-ui/Popup/Account/AccountExport';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { AccountDetailParam, ThemeProps, VoidFunction } from '@subwallet/extension-web-ui/types';
import { FormCallbacks, FormFieldData } from '@subwallet/extension-web-ui/types/form';
import { convertFieldToObject } from '@subwallet/extension-web-ui/utils/form/form';
import { Button, Form, Icon, Input, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { CircleNotch, Export, FloppyDiskBack, GitMerge, Trash } from 'phosphor-react';
import { RuleObject } from 'rc-field-form/lib/interface';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { AccountAddressList } from './AccountAddressList';
import { DerivedAccountList } from './DerivedAccountList';

enum FilterTabType {
  ACCOUNT_ADDRESS = 'account-address',
  DERIVED_ACCOUNT = 'derived-account',
  DERIVATION_INFO = 'derivation-info',
}

type Props = ThemeProps;
type ComponentProps = {
  accountProxy: AccountProxy;
  onBack: VoidFunction;
  requestViewDerivedAccountDetails?: boolean;
  requestViewDerivedAccounts?: boolean;
};

enum FormFieldName {
  NAME = 'name',
  DERIVED_SURI = 'derived-suri',
  DERIVED_NAME = 'derived-name',
}

// @ts-ignore
enum ActionType {
  EXPORT = 'export',
  DERIVE = 'derive',
  DELETE = 'delete'
}

interface DetailFormState {
  [FormFieldName.NAME]: string;
}

const instructionContents: InstructionContentType[] = [
  {
    title: 'Why do I need to enter a password?',
    description: 'For your wallet protection, SubWallet locks your wallet after 15 minutes of inactivity. You will need this password to unlock it.',
    type: 'warning'
  },
  {
    title: 'Can I recover a password?',
    description: 'The password is stored securely on your device. We will not be able to recover it for you, so make sure you remember it!',
    type: 'warning'
  }
];

const Component: React.FC<ComponentProps> = ({ accountProxy, onBack, requestViewDerivedAccountDetails, requestViewDerivedAccounts }: ComponentProps) => {
  const { activeModal } = useContext(ModalContext);
  const [exportAccountKey, setExportAccountKey] = useState<string>('exportAccountKey');
  const { isWebUI } = useContext(ScreenContext);

  const showDerivedAccounts = !!accountProxy.children?.length;

  const { t } = useTranslation();

  const notify = useNotification();
  const { goHome } = useDefaultNavigate();
  const navigate = useNavigate();

  const { alertModal, deriveModal: { open: openDeriveModal } } = useContext(WalletModalContext);
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const showDerivationInfoTab = useMemo((): boolean => {
    if (accountProxy.parentId) {
      return !!accountProxies.find((acc) => acc.id === accountProxy.parentId);
    } else {
      return false;
    }
  }, [accountProxies, accountProxy.parentId]);

  const getDefaultFilterTab = () => {
    if (requestViewDerivedAccounts && showDerivedAccounts) {
      return FilterTabType.DERIVED_ACCOUNT;
    } else if (requestViewDerivedAccountDetails) {
      return FilterTabType.DERIVATION_INFO;
    } else {
      return FilterTabType.ACCOUNT_ADDRESS;
    }
  };

  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(getDefaultFilterTab());

  const [form] = Form.useForm<DetailFormState>();

  const saveTimeOutRef = useRef<NodeJS.Timer>();

  // @ts-ignore
  const [deleting, setDeleting] = useState(false);
  // @ts-ignore
  const [deriving, setDeriving] = useState(false);
  const [saving, setSaving] = useState(false);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    const result = [
      {
        label: t('Account address'),
        value: FilterTabType.ACCOUNT_ADDRESS
      }
    ];

    if (showDerivedAccounts) {
      result.push({
        label: t('Derived account'),
        value: FilterTabType.DERIVED_ACCOUNT
      });
    }

    if (showDerivationInfoTab) {
      result.push({
        label: t('Derivation info'),
        value: FilterTabType.DERIVATION_INFO
      });
    }

    return result;
  }, [showDerivationInfoTab, showDerivedAccounts, t]);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  const doDelete = useCallback(() => {
    setDeleting(true);
    forgetAccount(accountProxy.id)
      .then(() => {
        goHome();
      })
      .catch((e: Error) => {
        notify({
          message: e.message,
          type: 'error'
        });
      })
      .finally(() => {
        setDeleting(false);
      });
  }, [accountProxy.id, goHome, notify]);

  const onDelete = useCallback(() => {
    alertModal.open({
      title: t('Confirmation'),
      type: NotificationType.WARNING,
      content: t('You will no longer be able to access this account via this extension'),
      okButton: {
        text: t('Remove'),
        onClick: () => {
          doDelete();
          alertModal.close();
        },
        schema: 'error'
      }
    });
  }, [alertModal, doDelete, t]);

  const onDerive = useCallback(() => {
    if (accountProxy) {
      openDeriveModal({
        proxyId: accountProxy.id
      });
    }
  }, [accountProxy, openDeriveModal]);

  const onExport = useCallback(() => {
    if (accountProxy.id) {
      if (isWebUI) {
        activeModal(ACCOUNT_EXPORT_MODAL);
      } else {
        navigate(`/accounts/export/${accountProxy.id}`);
      }
    }
  }, [accountProxy.id, activeModal, isWebUI, navigate]);

  // @ts-ignore
  const onCopyAddress = useCallback(() => {
    notify({
      message: t('Copied to clipboard')
    });
  }, [notify, t]);

  const parentDerivedAccountProxy = useMemo(() => {
    if (showDerivationInfoTab) {
      return accountProxies.find((acc) => acc.id === accountProxy.parentId);
    }

    return null;
  }, [accountProxies, accountProxy.parentId, showDerivationInfoTab]);

  const accountNameValidator = useCallback(async (validate: RuleObject, value: string) => {
    const accountProxyId = accountProxy.id;

    if (value) {
      try {
        const { isValid } = await validateAccountName({ name: value, proxyId: accountProxyId });

        if (!isValid) {
          return Promise.reject(t('Account name already in use'));
        }
      } catch (e) {
        return Promise.reject(t('Account name invalid'));
      }
    }

    return Promise.resolve();
  }, [accountProxy.id, t]);

  const onUpdate: FormCallbacks<DetailFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const changeMap = convertFieldToObject<DetailFormState>(changedFields);

    if (changeMap[FormFieldName.NAME]) {
      clearTimeout(saveTimeOutRef.current);
      setSaving(true);

      const isValidForm = form.getFieldsError().every((field) => !field.errors.length);

      if (isValidForm) {
        saveTimeOutRef.current = setTimeout(() => {
          form.submit();
        }, 1000);
      } else {
        setSaving(false);
      }
    }
  }, [form]);

  const onSubmit: FormCallbacks<DetailFormState>['onFinish'] = useCallback((values: DetailFormState) => {
    clearTimeout(saveTimeOutRef.current);
    const name = values[FormFieldName.NAME];

    if (name === accountProxy.name) {
      setSaving(false);

      return;
    }

    const accountProxyId = accountProxy.id;

    if (!accountProxyId) {
      setSaving(false);

      return;
    }

    editAccount(accountProxyId, name.trim())
      .catch((error: Error) => {
        form.setFields([{ name: FormFieldName.NAME, errors: [error.message] }]);
      })
      .finally(() => {
        setSaving(false);
      });
  }, [accountProxy.id, accountProxy.name, form]);

  const footerNode = useMemo(() => {
    if (![AccountProxyType.UNIFIED, AccountProxyType.SOLO].includes(accountProxy.accountType)) {
      return (
        <Button
          block={true}
          className={CN('account-button')}
          disabled={false}
          icon={(
            <Icon
              phosphorIcon={Trash}
              weight='fill'
            />
          )}
          loading={deleting}
          onClick={onDelete}
          schema='error'
        >
          {t('Delete account')}
        </Button>
      );
    }

    return <>
      <Button
        className={CN('account-button')}
        disabled={false}
        icon={(
          <Icon
            phosphorIcon={Trash}
            weight='fill'
          />
        )}
        loading={deleting}
        onClick={onDelete}
        schema='error'
      />
      <Button
        block={true}
        className={CN('account-button')}
        disabled={!accountProxy.accountActions.includes(AccountActions.DERIVE)}
        icon={(
          <Icon
            phosphorIcon={GitMerge}
            weight='fill'
          />
        )}
        loading={deriving}
        onClick={onDerive}
        schema='secondary'
      >
        {t('Derive')}
      </Button>
      <Button
        block={true}
        className={CN('account-button')}
        icon={(
          <Icon
            phosphorIcon={Export}
            weight='fill'
          />
        )}
        onClick={onExport}
        schema='secondary'
      >
        {t('Export')}
      </Button>
    </>;
  }, [accountProxy, deleting, deriving, onDelete, onDerive, onExport, t]);

  const onCancelExportAccount = useCallback(() => {
    setExportAccountKey(`exportAccountKey-${Date.now()}`);
  }, []);

  useEffect(() => {
    if (accountProxy) {
      form.setFieldValue(FormFieldName.NAME, accountProxy.name);
    }
  }, [accountProxy, form]);

  useEffect(() => {
    if (requestViewDerivedAccounts && showDerivedAccounts) {
      setSelectedFilterTab(FilterTabType.DERIVED_ACCOUNT);
    } else if (requestViewDerivedAccountDetails) {
      setSelectedFilterTab(FilterTabType.DERIVATION_INFO);
    } else {
      setSelectedFilterTab(FilterTabType.ACCOUNT_ADDRESS);
    }
  }, [requestViewDerivedAccountDetails, requestViewDerivedAccounts, showDerivedAccounts]);

  const renderDetailDerivedAccount = () => {
    return (
      <>
        <Form
          className={'derivation-info-form form-space-sm'}
          form={form}
          initialValues={{
            [FormFieldName.DERIVED_SURI]: accountProxy.suri || '',
            [FormFieldName.DERIVED_NAME]: parentDerivedAccountProxy?.name || ''

          }}
          name='derivation-info-form'
        >
          <Form.Item
            name={'derived-suri'}
            statusHelpAsTooltip={true}
          >
            <Input
              disabled={true}
              label={t('Derivation path')}
              placeholder={t('Derivation path')}
            />
          </Form.Item>
          {!!parentDerivedAccountProxy && <Form.Item
            name={'derived-name'}
            statusHelpAsTooltip={true}
          >
            <Input
              disabled={true}
              label={t('Parent account')}
              placeholder={t('Parent account')}
            />
          </Form.Item>}
        </Form>
      </>
    );
  };

  return (
    <Layout.WithSubHeaderOnly
      disableBack={false}
      footer={footerNode}
      subHeaderIcons={(
        isWebUI
          ? undefined
          : [
            {
              icon: <CloseIcon />,
              onClick: onBack,
              disabled: false
            }
          ]
      )}
      title={t('Account details')}
    >
      <div className='body-container'>
        <div className='main-content-area'>
          <Form
            className={'account-detail-form'}
            form={form}
            initialValues={{
              [FormFieldName.NAME]: accountProxy.name || ''
            }}
            name='account-detail-form'
            onFieldsChange={onUpdate}
            onFinish={onSubmit}
          >
            <div className='account-field-wrapper'>
              <div className='account-type-tag-wrapper'>
                <AccountProxyTypeTag
                  className={'account-type-tag'}
                  type={accountProxy.accountType}
                />
              </div>
              <Form.Item
                className={CN('account-field')}
                name={FormFieldName.NAME}
                rules={[
                  {
                    message: t('Account name is required'),
                    transform: (value: string) => value.trim(),
                    required: true
                  },
                  {
                    validator: accountNameValidator
                  }
                ]}
                statusHelpAsTooltip={true}
              >
                <Input
                  className='account-name-input'
                  disabled={false}
                  label={t('Account name')}
                  onBlur={form.submit}
                  placeholder={t('Account name')}
                  suffix={(
                    <Icon
                      className={CN({ loading: saving })}
                      phosphorIcon={saving ? CircleNotch : FloppyDiskBack}
                      size='sm'
                    />
                  )}
                />
              </Form.Item>
            </div>
          </Form>

          <FilterTabs
            className={'filter-tabs-container'}
            items={filterTabItems}
            onSelect={onSelectFilterTab}
            selectedItem={selectedFilterTab}
          />
          {
            selectedFilterTab === FilterTabType.ACCOUNT_ADDRESS && (
              <AccountAddressList
                accountProxy={accountProxy}
                className={'list-container'}
              />
            )
          }
          {
            selectedFilterTab === FilterTabType.DERIVED_ACCOUNT && (
              <DerivedAccountList
                accountProxy={accountProxy}
                className={'list-container'}
              />
            )
          }
          {
            selectedFilterTab === FilterTabType.DERIVATION_INFO && (
              renderDetailDerivedAccount()
            )
          }
        </div>

        {isWebUI &&
        <InstructionContainer
          className='instruction-area'
          contents={instructionContents}
        />
        }
      </div>
      {isWebUI && (
        <AccountExport
          accountProxyId={accountProxy.id}
          isModalMode={true}
          key={exportAccountKey}
          onCancelModal={onCancelExportAccount}
        />
      )}
    </Layout.WithSubHeaderOnly>
  );
};

const Wrapper = ({ className }: Props) => {
  const { goHome } = useDefaultNavigate();
  const { accountProxyId } = useParams();
  const accountProxy = useGetAccountProxyById(accountProxyId);
  const locationState = useLocation().state as AccountDetailParam | undefined;

  useEffect(() => {
    if (!accountProxy) {
      goHome();
    }
  }, [accountProxy, goHome]);

  if (!accountProxy) {
    return (
      <></>
    );
  }

  return (
    <PageWrapper
      className={CN(className)}
    >
      <Component
        accountProxy={accountProxy}
        onBack={goHome}
        requestViewDerivedAccountDetails={locationState?.requestViewDerivedAccountDetails}
        requestViewDerivedAccounts={locationState?.requestViewDerivedAccounts}
      />
    </PageWrapper>
  );
};

const AccountDetail = styled(Wrapper)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '.ant-sw-screen-layout-body': {
      display: 'flex',
      overflow: 'hidden'
    },

    '.body-container': {
      flexGrow: 1
    },

    '.main-content-area': {
      display: 'flex',
      overflow: 'hidden',
      flexDirection: 'column'
    },

    '.derivation-wrapper': {
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.derivation-info-form.derivation-info-form': {
      paddingTop: 0
    },

    '.ant-sw-screen-layout-footer': {
      paddingTop: token.paddingSM,
      paddingBottom: 24
    },

    '.ant-sw-screen-layout-footer-content': {
      display: 'flex',
      gap: token.sizeSM
    },

    '.account-detail-form, .derivation-info-form': {
      paddingTop: token.padding,
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.account-detail-form .ant-form-item': {
      marginBottom: 0
    },

    '.account-field-wrapper': {
      position: 'relative'
    },

    '.account-type-tag-wrapper': {
      position: 'absolute',
      zIndex: 1,
      right: token.sizeSM,
      top: token.sizeXS,
      display: 'flex'
    },

    '.account-type-tag': {
      marginRight: 0
    },

    '.account-type-tag + .derived-account-flag': {
      marginLeft: token.marginXS,
      color: token.colorTextLight3
    },

    '.account-name-input .ant-input-suffix .anticon': {
      minWidth: 40,
      justifyContent: 'center'
    },

    '.list-container': {
      flex: 1
    },

    '.filter-tabs-container': {
      gap: 0,
      paddingLeft: token.paddingXXS,
      paddingRight: token.paddingXXS,

      '.__tab-item:after': {
        display: 'none'
      },

      '.__tab-item-label': {
        padding: token.paddingSM,
        lineHeight: '20px',
        fontSize: '11px',
        textTransform: 'uppercase'
      }
    },

    '.web-ui-enable &': {
      '.ant-sw-sub-header-container': {
        marginBottom: 24
      },

      '.body-container': {
        display: 'flex',
        flexGrow: 0,
        width: extendToken.twoColumnWidth,
        maxWidth: '100%',
        margin: '0 auto',
        overflow: 'hidden',

        '& > *': {
          flex: 1
        },

        '.instruction-area': {
          paddingRight: token.padding
        },

        '.form-container': {
          '.ant-btn': {
            width: '100%'
          }
        }
      },

      '.ant-sw-screen-layout-footer': {
        paddingTop: 0
      },

      '.ant-sw-screen-layout-footer-content': {
        maxWidth: extendToken.twoColumnWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative',
        paddingTop: 26
      },

      '.ant-sw-screen-layout-footer-content:before': {
        content: '""',
        height: 2,
        backgroundColor: token.colorBgDivider,
        display: 'block',
        position: 'absolute',
        left: token.size,
        right: token.size,
        top: 0
      }
    }
  };
});

export default AccountDetail;
