// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressInput } from '@subwallet/extension-koni-ui/components';
import { CREATE_RETURN, CROWDLOAN_UNLOCK_TIME, DEFAULT_ROUTER_PATH, NEW_SEED_MODAL } from '@subwallet/extension-koni-ui/constants';
import { DEFAULT_CROWDLOAN_UNLOCK_TIME } from '@subwallet/extension-koni-ui/constants/event';
import { WebUIContext } from '@subwallet/extension-koni-ui/contexts/WebUIContext';
import Countdown from '@subwallet/extension-koni-ui/Popup/CrowdloanUnlockCampaign/components/Countdown';
import NoteBox from '@subwallet/extension-koni-ui/Popup/CrowdloanUnlockCampaign/components/NoteBox';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { FormCallbacks, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Form, Icon, Image, ModalContext } from '@subwallet/react-ui';
import { ValidateStatus } from '@subwallet/react-ui/es/form/FormItem';
import { ArrowCounterClockwise, PlusCircle, Question, Vault, Wallet } from 'phosphor-react';
import React, { Context, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import { isAddress } from '@polkadot/util-crypto';

type Props = ThemeProps;

type SubmitResponse = {
  status?: ValidateStatus;
  message?: string;
};

export interface FormParams {
  address: string;
}

const Component: React.FC<Props> = ({ className = '' }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const [{ message: responseMessage, status: responseStatus }, setSubmitResponse] =
    useState<SubmitResponse>({});
  const [isWrongAddress, setIsWrongAddress] = useState<boolean>(false);
  const logoMap = useContext<Theme>(ThemeContext as Context<Theme>).logoMap;
  const { setWebBaseClassName } = useContext(WebUIContext);
  const { activeModal } = useContext(ModalContext);
  const [crowdloanUnlockTime] = useLocalStorage<number>(CROWDLOAN_UNLOCK_TIME, DEFAULT_CROWDLOAN_UNLOCK_TIME);

  const outletContext: {
    crowdloanUnlockTime: number,
  } = useOutletContext();

  const targetCrowdloanUnlockTime = outletContext?.crowdloanUnlockTime || crowdloanUnlockTime;

  const formDefault = useMemo((): FormParams => {
    return {
      address: ''
    };
  }, []);

  const [form] = Form.useForm<FormParams>();

  const addressValue = Form.useWatch('address', form);

  const onCheckCrowdloanContributions: FormCallbacks<FormParams>['onFinish'] = useCallback(({ address }: FormParams) => {
    if (isAddress(address)) {
      navigate('/crowdloan-unlock-campaign/contributions-result', { state: { address } });
    } else {
      setSubmitResponse({
        status: 'error',
        message: t('Invalid address. Check again or create a new account to get started.')
      });
      setIsWrongAddress(true);
    }
  }, [navigate, t]);

  const onValuesChange: FormCallbacks<FormParams>['onValuesChange'] = useCallback(
    () => {
      setSubmitResponse({});
    },
    []
  );

  const goEarningDemo = useCallback(() => {
    navigate('/earning-demo');
  }, [navigate]);

  const { isNoAccount } = useSelector((state: RootState) => state.accountState);
  const [, setReturnStorage] = useLocalStorage(CREATE_RETURN, DEFAULT_ROUTER_PATH);

  const onClickCreateNewWallet = useCallback(() => {
    if (isNoAccount) {
      setReturnStorage('/home/earning/');
      navigate('/welcome');
    } else {
      activeModal(NEW_SEED_MODAL);
    }
  }, [activeModal, isNoAccount, navigate, setReturnStorage]);

  useEffect(() => {
    setWebBaseClassName(`${className}-web-base-container`);

    return () => {
      setWebBaseClassName('');
    };
  }, [className, setWebBaseClassName]);

  return (
    <div className={className}>
      <div className={'__body-area'}>
        <div className='__countdown-area'>
          <div className='__countdown-icon'>
            <Image
              height={'100%'}
              shape={'circle'}
              src={logoMap.network.rocketIcon as string}
              width={'100%'}
            />
          </div>
          <div className={'__countdown-title'}>
            {t('Next Polkadot crowdloan unlocking in')}
          </div>
          <Countdown
            className={'__countdown'}
            targetTime={targetCrowdloanUnlockTime}
          />
        </div>

        <div className='__form-area'>
          <Form
            className={'__form-container'}
            form={form}
            initialValues={formDefault}
            onFinish={onCheckCrowdloanContributions}
            onValuesChange={onValuesChange}
          >
            <Form.Item
              help={responseMessage}
              name={'address'}
              statusHelpAsTooltip
              validateStatus={responseStatus}
            >
              <AddressInput
                placeholder={t('Enter your Polkadot wallet address')}
                prefix={(
                  <Icon
                    phosphorIcon={Wallet}
                    size='md'
                  />
                )}
                showDisplayOverlay={false}
                showLabel={false}
                showPlainAddressOnly
                showScanner
              />
            </Form.Item>
          </Form>

          {
            !isWrongAddress && (
              <Button
                block
                className='__check-contributions-button'
                disabled={!addressValue}
                onClick={form.submit}
                schema='primary'
              >
                {t('Check your crowdloan contributions')}
              </Button>
            )
          }

          {
            isWrongAddress && (
              <div className='__form-buttons'>
                <Button
                  block
                  className='__check-again-button'
                  disabled={!addressValue}
                  icon={
                    <Icon
                      customSize={'28px'}
                      phosphorIcon={ArrowCounterClockwise}
                      weight='fill'
                    />
                  }
                  onClick={form.submit}
                  schema='secondary'
                >
                  {t('Check again')}
                </Button>

                <Button
                  block
                  className='__create-a-wallet-button'
                  icon={
                    <Icon
                      customSize={'28px'}
                      phosphorIcon={PlusCircle}
                      weight='fill'
                    />
                  }
                  onClick={onClickCreateNewWallet}
                  schema='primary'
                >
                  {t('Create a new account')}
                </Button>
              </div>
            )
          }
        </div>
      </div>

      <div className={'__footer-area'}>
        <NoteBox
          className={'__note-box'}
          content={t('There\'re multiple ways you can play with your unlocked DOT, such as native staking, liquid staking, or lending. Check out SubWallet Dashboard for curated options with competitive APY to earn yield on your DOT.')}
          title={t('Crowdloan unlock, then what?')}
        />

        <div className='__footer-buttons'>
          <Button
            className={'__footer-button'}
            contentAlign={'left'}
            icon={
              <Icon
                className='__footer-button-icon'
                iconColor={token['green-6']}
                phosphorIcon={Vault}
                size='md'
                weight='fill'
              />
            }
            onClick={goEarningDemo}
            schema={'secondary'}
          >
            <div className={'__footer-button-content'}>
              <div className={'__footer-button-title'}>{t('Rewards: 18% - 24%')}</div>

              <div className={'__footer-button-subtitle'}>{t('Earning with SubWallet Dashboard')}</div>
            </div>
          </Button>

          <Button
            className={'__footer-button'}
            contentAlign={'left'}
            icon={
              <Icon
                className='__footer-button-icon'
                iconColor={token['yellow-6']}
                phosphorIcon={Question}
                size='md'
                weight='fill'
              />
            }
            schema={'secondary'}
          >
            <div className={'__footer-button-content'}>
              <div className={'__footer-button-title'}>{t('Frequently asked questions')}</div>

              <div className={'__footer-button-subtitle'}>{t('Create a new account with web wallet')}</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

const CheckCrowdloanContributions = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    paddingLeft: token.padding,
    paddingRight: token.padding,
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'fixed',
    inset: 0,
    maxWidth: 816,
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'auto',

    '&-web-base-container': {
      '.web-layout-header-simple': {
        '.__back-button, .__title-wrapper': {
          display: 'none'
        }
      }
    },

    '.__countdown-area': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },

    '.__countdown-icon': {
      width: 104,
      height: 104,
      color: token.colorTextLight1,
      marginBottom: 36
    },

    '.__countdown-title': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextLight4,
      fontWeight: token.headingFontWeight,
      marginBottom: 24
    },

    '.__countdown': {
      marginBottom: 60
    },

    '.__body-area': {
      paddingTop: 112,
      maxWidth: 584,
      flex: 1,
      width: '100%'
    },

    '.__form-area': {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: 80
    },

    '.__form-container': {
      paddingBottom: token.sizeXS
    },

    '.__check-contributions-button': {
      maxWidth: 384,
      alignSelf: 'center'
    },

    '.__form-buttons': {
      display: 'flex',
      gap: token.size
    },

    '.__check-again-button, .__create-a-wallet-button': {
      flex: 1
    },

    '.__footer-area': {
      borderTop: `2px solid ${token.colorBgDivider}`,
      paddingBottom: 58
    },

    '.__note-box': {
      paddingTop: token.sizeLG,
      paddingBottom: token.sizeLG
    },

    '.__footer-buttons': {
      display: 'flex',
      gap: token.size,
      flexWrap: 'wrap'
    },

    '.__footer-button': {
      height: 72,
      flex: 1,
      paddingRight: token.paddingSM,
      paddingLeft: token.paddingSM,
      gap: token.size
    },

    '.__footer-button-icon': {
      width: 40,
      height: 40,
      justifyContent: 'center'
    },

    '.__footer-button-content': {
      textAlign: 'left'
    },

    '.__footer-button-title': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextLight1,
      marginBottom: token.marginXXS
    },

    '.__footer-button-subtitle': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight3
    }
  };
});

export default CheckCrowdloanContributions;
