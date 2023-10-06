// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldCompoundingPeriod, YieldPoolInfo } from '@subwallet/extension-base/background/KoniTypes';
import { calculateReward } from '@subwallet/extension-base/koni/api/yield';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { balanceFormatter, formatNumber } from '@subwallet/extension-base/utils';
import { CREATE_RETURN, DEFAULT_ROUTER_PATH, DEFAULT_YIELD_PARAMS, EARNING_INFO_MODAL, YIELD_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { FormCallbacks, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isAccountAll } from '@subwallet/extension-koni-ui/utils';
import { Button, Divider, Form, Icon, ModalContext, Number } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { Info, PlusCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { EarningTokenItem, EarningTokenList } from '../../Earning';
import { EarningMethodSelector } from '../../Field';
import { MetaInfo } from '../../MetaInfo';
import { BaseModal } from '../BaseModal';

interface Props extends ThemeProps {
  defaultItem: YieldPoolInfo;
}

const modalId = EARNING_INFO_MODAL;

interface EarningInfoFormProps {
  method: string;
}

interface APYItem {
  symbol: string;
  token: string;
  children: string;
}

interface RequireTokenItem {
  symbol: string;
  token: string;
  children: string;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, defaultItem } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useTheme() as Theme;

  const { addExclude, checkActive, inactiveModal, removeExclude } = useContext(ModalContext);

  const isActive = checkActive(modalId);

  const { poolInfo } = useSelector((state: RootState) => state.yieldPool);
  const { currentAccount, isNoAccount } = useSelector((state: RootState) => state.accountState);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { priceMap } = useSelector((state: RootState) => state.price);

  const [, setYieldStorage] = useLocalStorage(YIELD_TRANSACTION, DEFAULT_YIELD_PARAMS);
  const [, setReturnStorage] = useLocalStorage(CREATE_RETURN, DEFAULT_ROUTER_PATH);
  const [form] = Form.useForm<EarningInfoFormProps>();

  const formDefault: EarningInfoFormProps = useMemo(() => {
    return {
      method: defaultItem.slug
    };
  }, [defaultItem.slug]);

  const currentMethod = Form.useWatch('method', form);

  const currentItem = useMemo(() => currentMethod ? poolInfo[currentMethod] : defaultItem, [currentMethod, poolInfo, defaultItem]);

  const currentAsset = useMemo(() => {
    return assetRegistry[currentItem.inputAssets[0]];
  }, [assetRegistry, currentItem.inputAssets]);

  const currentDecimal = useMemo(() => {
    return currentAsset ? _getAssetDecimals(currentAsset) : 0;
  }, [currentAsset]);

  const totalApy = useMemo(() => {
    return currentItem.stats?.totalApy || calculateReward(currentItem.stats?.totalApr || 0, undefined, YieldCompoundingPeriod.YEARLY).apy || 0;
  }, [currentItem.stats?.totalApr, currentItem.stats?.totalApy]);

  const totalStakedValue = useMemo(() => {
    const token = new BigN(currentItem.stats?.tvl || 0);
    const price = priceMap[currentAsset.priceId || ''];

    return token.multipliedBy(price);
  }, [currentAsset.priceId, currentItem.stats?.tvl, priceMap]);

  const apyItems = useMemo((): APYItem[] => {
    return currentItem.stats?.assetEarning?.map((value) => {
      const asset = assetRegistry[value.slug];
      const apy = value.apy || calculateReward(value.apr || 0, undefined, YieldCompoundingPeriod.YEARLY).apy || 0;
      const apyStr = formatNumber(apy, 0, balanceFormatter);

      return {
        children: `${apyStr}% ${asset.symbol}`,
        token: asset.slug,
        symbol: asset.symbol
      };
    }) || [];
  }, [assetRegistry, currentItem.stats?.assetEarning]);

  const requireTokenItems = useMemo((): RequireTokenItem[] => {
    return currentItem.feeAssets.map((slug) => {
      const asset = assetRegistry[slug];

      return {
        children: asset.symbol,
        token: asset.slug,
        symbol: asset.symbol
      };
    });
  }, [assetRegistry, currentItem.feeAssets]);

  const onClose = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickInfo = useCallback(() => {
    // TODO: add action
  }, []);

  const onSubmit: FormCallbacks<EarningInfoFormProps>['onFinish'] = useCallback(() => {
    inactiveModal(modalId);

    if (isNoAccount) {
      setReturnStorage('/home/earning');
      navigate('/welcome');
    } else {
      const address = currentAccount ? isAccountAll(currentAccount.address) ? '' : currentAccount.address : '';

      setYieldStorage({
        ...DEFAULT_YIELD_PARAMS,
        method: currentItem.slug,
        from: address,
        chain: currentItem.chain,
        asset: currentItem.inputAssets[0]
      });

      navigate('/transaction/earn');
    }
  }, [inactiveModal, isNoAccount, setReturnStorage, navigate, currentAccount, setYieldStorage, currentItem.slug, currentItem.chain, currentItem.inputAssets]);

  useEffect(() => {
    addExclude(modalId);

    return () => {
      removeExclude(modalId);
    };
  }, [addExclude, removeExclude]);

  useEffect(() => {
    form.setFieldValue('method', defaultItem.slug);
  }, [form, defaultItem, isActive]);

  return (
    <BaseModal
      className={CN(className)}
      footer={(
        <>
          <Button
            block={true}
            icon={(
              <Icon
                phosphorIcon={Info}
                weight='fill'
              />
            )}
            onClick={onClickInfo}
            schema='secondary'
          >
            {t('More info')}
          </Button>
          <Button
            block={true}
            icon={(
              <Icon
                phosphorIcon={PlusCircle}
                weight='fill'
              />
            )}
            onClick={form.submit}
          >
            {t('Stake now')}
          </Button>
        </>
      )}
      id={modalId}
      onCancel={onClose}
      title={t('Staking information')}
    >
      <div>
        <EarningTokenList />
        <Form
          className={'form-container form-space-sm earning-info-form-container'}
          form={form}
          initialValues={formDefault}
          onFinish={onSubmit}
        >
          <Form.Item
            colon={false}
            label={'Select method'}
            name={'method'}
          >
            <EarningMethodSelector
              items={Object.values(poolInfo)}
              showChainInSelected
            />
          </Form.Item>
        </Form>

        <Divider className='divider' />

        <div className='info-container'>
          <div className='title'>
            {t('About')}
          </div>
          <div className='description'>
            {currentItem.description}
          </div>
          <div className='title'>
            {t('Maximum possible APR')}
          </div>
          <div className='reward-text'>
            <Number
              decimal={0}
              decimalColor={token.colorSuccess}
              intColor={token.colorSuccess}
              size={30}
              suffix={'%'}
              unitColor={token.colorSuccess}
              value={totalApy}
              weight={600}
            />
            &nbsp;{t('rewards')}
          </div>
          <div className='token-item-container'>
            {
              apyItems.map((value) => {
                return (
                  <EarningTokenItem
                    key={value.token}
                    {...value}
                  />
                );
              })
            }
          </div>
          <div className='description'>
            <Trans
              components={{
                highlight: (
                  <span
                    className='link'
                    onClick={onClickInfo}
                  />
                )
              }}
              i18nKey={'Maximum APR when Staking {{symbol}} for a period of 12 months. <highlight>Learn more</highlight>'}
              values={{
                symbol: currentAsset.symbol
              }}
            />
          </div>
          <MetaInfo
            spaceSize='sm'
          >
            <MetaInfo.Number
              decimals={currentDecimal}
              label={t('Total value staked')}
              prefix={'$'}
              value={totalStakedValue}
              valueColorSchema={'success'}
            />
            <MetaInfo.Number
              decimals={currentDecimal}
              label={t('Minimum active')}
              suffix={currentAsset.symbol}
              value={currentItem.stats?.minJoinPool || 0}
              valueColorSchema={'success'}
            />
          </MetaInfo>
        </div>

        <Divider className='divider' />
        <div className='info-container'>
          <div className='title'>
            {t('Requirement assets')}
          </div>
          <div className='token-item-container'>
            {
              requireTokenItems.map((value) => {
                return (
                  <EarningTokenItem
                    key={value.token}
                    {...value}
                  />
                );
              })
            }
          </div>
          <div className='title'>
            {t('Reward distribution')}
          </div>
          <div className='description'>
            {t('Payable every {{number}} hours', { replace: { number: 8 } })}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

const EarningInfoModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-footer': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      borderTop: 'none'
    },

    '.divider': {
      backgroundColor: token.colorBgDivider,
      marginTop: token.marginSM,
      marginBottom: token.marginSM
    },

    '.earning-info-form-container': {
      marginTop: token.marginSM,

      '.ant-form-item-label': {
        display: 'flex',
        alignItems: 'center'
      },

      '.ant-form-item-label > label': {
        color: token.colorTextLight4
      },

      '.ant-form-item-control': {
        '& > div:nth-child(2)': {
          display: 'none !important'
        }
      },

      '.ant-form-item-margin-offset': {
        marginBottom: '0 !important'
      }
    },

    '.info-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeSM
    },

    '.token-item-container': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: token.sizeSM
    },

    '.title': {
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      fontWeight: token.fontWeightStrong,
      color: token.colorTextHeading
    },

    '.description': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      fontWeight: token.bodyFontWeight,
      color: token.colorTextTertiary
    },

    '.reward-text': {
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      fontWeight: token.fontWeightStrong,
      color: token.colorTextTertiary,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline'
    },

    '.link': {
      color: token.colorLink
    }
  };
});

export default EarningInfoModal;
