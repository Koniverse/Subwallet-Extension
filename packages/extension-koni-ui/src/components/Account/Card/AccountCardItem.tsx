// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PREDEFINED_WALLETS } from '@subwallet/extension-koni-ui/constants';
import useAccountAvatarInfo from '@subwallet/extension-koni-ui/hooks/account/useAccountAvatarInfo';
import useAccountAvatarTheme from '@subwallet/extension-koni-ui/hooks/account/useAccountAvatarTheme';
import useGetAccountSignModeByAddress from '@subwallet/extension-koni-ui/hooks/account/useGetAccountSignModeByAddress';
import { useIsMantaPayEnabled } from '@subwallet/extension-koni-ui/hooks/account/useIsMantaPayEnabled';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { PhosphorIcon } from '@subwallet/extension-koni-ui/types';
import { AccountSignMode } from '@subwallet/extension-koni-ui/types/account';
import { Button, Icon, Image, Logo } from '@subwallet/react-ui';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import CN from 'classnames';
import { CheckCircle, CopySimple, Eye, PencilSimpleLine, PuzzlePiece, QrCode, ShieldCheck, Swatches } from 'phosphor-react';
import React, { Context, useCallback, useContext, useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { SwipeableListItem, SwipeAction, TrailingActions, Type as ListType } from 'react-swipeable-list';
import styled, { ThemeContext } from 'styled-components';

import { KeypairType } from '@polkadot/util-crypto/types';

export interface _AccountCardItem {
  className?: string;
  onPressMoreButton?: () => void;
  source?: string;
  isSelected?: boolean;
  onClickQrButton?: (address: string) => void;
  accountName?: string;
  address?: string;
  genesisHash?: string | null;
  preventPrefix?: boolean;
  type?: KeypairType;
  moreIcon?: PhosphorIcon;
  enableSwipe: boolean;
  isSwiped: boolean;
  onSwipe?: (address: string | undefined) => void;
}

interface AbstractIcon {
  type: 'icon' | 'node',
  value: PhosphorIcon | React.ReactNode
}

interface SwIconProps extends AbstractIcon {
  type: 'icon',
  value: PhosphorIcon
}

interface NodeIconProps extends AbstractIcon {
  type: 'node',
  value: React.ReactNode
}

type IconProps = SwIconProps | NodeIconProps;

function Component (props: _AccountCardItem): React.ReactElement<_AccountCardItem> {
  const { accountName,
    address,
    enableSwipe,
    genesisHash,
    isSelected,
    isSwiped,
    moreIcon,
    onClickQrButton,
    onPressMoreButton,
    onSwipe,
    preventPrefix,
    source,
    type: givenType } = props;

  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const { address: formattedAddress, prefix } = useAccountAvatarInfo(address ?? '', preventPrefix, genesisHash, givenType);
  const notify = useNotification();
  const { t } = useTranslation();

  const avatarTheme = useAccountAvatarTheme(address || '');

  const signMode = useGetAccountSignModeByAddress(address);
  const isMantaPayEnabled = useIsMantaPayEnabled(address);

  const iconProps: IconProps | undefined = useMemo((): IconProps | undefined => {
    switch (signMode) {
      case AccountSignMode.LEDGER:
        return {
          type: 'icon',
          value: Swatches
        };
      case AccountSignMode.QR:
        return {
          type: 'icon',
          value: QrCode
        };
      case AccountSignMode.READ_ONLY:
        return {
          type: 'icon',
          value: Eye
        };

      case AccountSignMode.INJECTED:
        if (source && PREDEFINED_WALLETS[source]) {
          return {
            type: 'node',
            value: <Image
              className='logo-image'
              height='var(--height)'
              shape='square'
              src={PREDEFINED_WALLETS[source].mcicon}
            />
          };
        } else {
          return {
            type: 'icon',
            value: PuzzlePiece
          };
        }
    }

    if (isMantaPayEnabled) {
      return {
        type: 'icon',
        value: ShieldCheck
      };
    }

    return undefined;
  }, [isMantaPayEnabled, signMode, source]);

  const _onClickMore: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> = React.useCallback((event) => {
    event.stopPropagation();
    onPressMoreButton && onPressMoreButton();
  }, [onPressMoreButton]);

  const _onClickQrBtn = useCallback(() => {
    onClickQrButton?.(formattedAddress || '');
  }, [onClickQrButton, formattedAddress]);

  const _onClickCopyButton = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
    notify({
      message: t('Copied to clipboard')
    });
  }, [notify, t]);

  const truncatedAddress = formattedAddress ? `${formattedAddress.substring(0, 9)}...${formattedAddress.slice(-9)}` : '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleOnClickSwipe = () => {
  };

  const handleSwipeStart = useCallback(() => {
    if (onSwipe) {
      onSwipe(address);
    }
  }, [onSwipe, address]);

  // const swipeStyle = isSwiped ? { transform: 'translateX(0px)' } : { transform: 'translateX(-168px)' };
  const trailingActions = (address: string | undefined) => (
    <TrailingActions>
      {/* eslint-disable-next-line react/jsx-no-bind */}
      <SwipeAction onClick={handleOnClickSwipe}>
        <div className='__btn-container'>
          <div className='__all-icon'>
            <CopyToClipboard text={formattedAddress || ''}>
              <Button
                className={'__swipe-copy-btn'}
                icon={
                  <Icon
                    iconColor={'#D9A33E'}
                    phosphorIcon={CopySimple}
                    size='sm'
                  />
                }
                onClick={_onClickCopyButton}
                size='xs'
                tooltip={t('Copy address')}
                type='ghost'
              />
            </CopyToClipboard>
          </div>
          <div className='__all-icon'>
            <Button
              className={'__swipe-qr-code-btn'}
              icon={
                <Icon
                  iconColor={'#004BFF'}
                  phosphorIcon={QrCode}
                  size='sm'
                />
              }
              onClick={_onClickQrBtn}
              size='xs'
              tooltip={t('Show QR code')}
              type='ghost'
            />
          </div>
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  if (enableSwipe) {
    return (
      <>
        <div className={CN(props.className)}>
          <div className='__item-left-part'>
            <SwAvatar
              identPrefix={prefix}
              isShowSubIcon={true}
              size={40}
              subIcon={(
                <Logo
                  network={avatarTheme}
                  shape={'circle'}
                  size={16}
                />
              )}
              theme={avatarTheme}
              value={formattedAddress || ''}
            />
          </div>
          <div className='__item-center-part'>
            <div className='__item-name'>{accountName}</div>
            <div className='__item-address'>{truncatedAddress}</div>
          </div>
          <div className='__item-right-part'>
            <div className='__item-actions'>
              <Button
                className='-show-on-hover'
                icon={
                  <Icon
                    phosphorIcon={QrCode}
                    size='sm'
                  />
                }
                onClick={_onClickQrBtn}
                size='xs'
                tooltip={t('Show QR code')}
                type='ghost'
              />
              <CopyToClipboard text={formattedAddress || ''}>
                <Button
                  className='-show-on-hover'
                  icon={
                    <Icon
                      phosphorIcon={CopySimple}
                      size='sm'
                    />
                  }
                  onClick={_onClickCopyButton}
                  size='xs'
                  tooltip={t('Copy address')}
                  type='ghost'
                />
              </CopyToClipboard>
              <Button
                icon={
                  <Icon
                    phosphorIcon={moreIcon || PencilSimpleLine}
                    size='sm'
                  />
                }
                onClick={_onClickMore}
                size='xs'
                type='ghost'

              />
            </div>
            <div className='__item-actions-overlay'>
              {isSelected && (
                <Button
                  icon={
                    <Icon
                      iconColor={token.colorSuccess}
                      phosphorIcon={CheckCircle}
                      size='sm'
                      weight='fill'
                    />
                  }
                  size='xs'
                  type='ghost'
                />
              )}
              {iconProps && (
                <Button
                  icon={
                    iconProps.type === 'icon'
                      ? (
                        <Icon
                          phosphorIcon={iconProps.value}
                          size='sm'
                        />
                      )
                      : iconProps.value
                  }
                  size='xs'
                  type='ghost'
                />
              )}
            </div>
          </div>

        </div>
      </>
    );
  } else {
    return (

      <div className={CN(props.className, '-swipe-mode')}>
        <SwipeableListItem
          key={address}
          listType={ListType.IOS}
          onSwipeStart={handleSwipeStart}
          trailingActions={trailingActions(address)}
        >
          <div className='__item-row'>
            <SwAvatar
              identPrefix={prefix}
              isShowSubIcon={true}
              size={40}
              subIcon={(
                <Logo
                  network={avatarTheme}
                  shape={'circle'}
                  size={16}
                />
              )}
              theme={avatarTheme}
              value={formattedAddress || ''}
            />
            <div className='__item-center'>
              <div className='__swipe-item-name'>{accountName}</div>
              <div className='__swipe-item-address'>{truncatedAddress}</div>
            </div>
          </div>
          <div className={'__item-right'}>
            {isSelected && (
              <Button
                icon={
                  <Icon
                    iconColor={token.colorSuccess}
                    phosphorIcon={CheckCircle}
                    size='sm'
                    weight='fill'
                  />
                }
                size='xs'
                type='ghost'
              />
            )}
            {iconProps && (
              <Button
                icon={
                  iconProps.type === 'icon'
                    ? (
                      <Icon
                        phosphorIcon={iconProps.value}
                        size='sm'
                      />
                    )
                    : iconProps.value
                }
                size='xs'
                type='ghost'
              />
            )}
            <Button
              icon={
                <Icon
                  phosphorIcon={moreIcon || PencilSimpleLine}
                  size='sm'
                />
              }
              onClick={_onClickMore}
              size='xs'
              type='ghost'

            />
          </div>
        </SwipeableListItem>
      </div>
    );
  }
}

const AccountCardItem = styled(Component)<_AccountCardItem>(({ theme }) => {
  const { token } = theme as Theme;

  return {
    height: 68,
    background: token.colorBgSecondary,
    padding: token.paddingSM,
    paddingRight: token.paddingXXS,
    borderRadius: token.borderRadiusLG,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    transition: `background ${token.motionDurationMid} ease-in-out`,

    '.__item-left-part': {
      paddingRight: token.paddingXS
    },
    '.__item-center-part': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flex: 1
    },
    '.__item-name': {
      fontSize: token.fontSizeLG,
      color: token.colorTextLight1,
      lineHeight: token.lineHeightLG,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap'
    },
    '.__item-address': {
      fontSize: token.fontSizeSM,
      color: token.colorTextLight4,
      lineHeight: token.lineHeightSM,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap'
    },
    '.__item-right-part': {
      marginLeft: 'auto',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative'
    },
    '.__item-actions-overlay': {
      display: 'flex',
      flexDirection: 'row',
      pointerEvents: 'none',
      position: 'absolute',
      inset: 0,
      opacity: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginRight: 40,
      transition: `opacity ${token.motionDurationMid} ease-in-out`
    },
    '.-show-on-hover': {
      opacity: 0,
      transition: `opacity ${token.motionDurationMid} ease-in-out`
    },
    '&:hover': {
      background: token.colorBgInput,
      '.__item-actions-overlay': {
        opacity: 0
      },
      '.-show-on-hover': {
        opacity: 1
      }
    },
    '&.-swipe-mode': {
      paddingRight: 0,
      display: 'flex',
      '.__btn-container': {
        backgroundColor: 'rgb(12 12 12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row'
      },
      '.swipeable-list-item__content': {
        paddingTop: 12,
        paddingBottom: 12,
        display: 'flex',
        justifyContent: 'space-between'
      },
      '.__all-icon': {
        padding: 8
      },
      '.__item-content': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      '.__item-row': {
        display: 'flex'
      },
      '.__item-center': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingLeft: 8
      },
      '.__item-address': {
        color: '#FFFFFF73'
      },
      '.__swipe-qr-code-btn': {
        backgroundColor: '#004BFF1A',
        borderRadius: '100%'
      },
      '.__swipe-copy-btn': {
        backgroundColor: '#D9A33E1A',
        borderRadius: '100%'
      },
      '.__swipe-pencil-btn': {
        backgroundColor: '#BF16161A',
        borderRadius: '100%'
      },
      '.__item-right': {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
      },
      '.__swipe-item-name': {
        fontSize: token.fontSizeLG,
        color: token.colorTextLight1,
        lineHeight: token.lineHeightLG,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        'white-space': 'nowrap'
      },
      '.__swipe-item-address': {
        fontSize: token.fontSizeSM,
        color: token.colorTextLight4,
        lineHeight: token.lineHeightSM,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        'white-space': 'nowrap'
      }
    }
  };
});

export default AccountCardItem;
