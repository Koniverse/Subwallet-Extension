// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { reformatAddress } from '@subwallet/extension-base/utils';
import { UNIFIED_CHAIN_SS58_PREFIX } from '@subwallet/extension-koni-ui/constants';
import { useIsPolkadotUnifiedAddress } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import AccountProxyAvatar from './AccountProxyAvatar';

type Props = ThemeProps & {
  name?: string;
  avatarValue?: string;
  address: string;
  onClick?: VoidFunction;
  isSelected?: boolean;
  showUnselectIcon?: boolean;
  chainSlug?: string;
  onCancel?: VoidFunction;
  onClickInfoButton?: VoidFunction
}

function Component (props: Props): React.ReactElement<Props> {
  const { address,
    avatarValue,
    chainSlug, className, isSelected, name, onClick, onClickInfoButton, showUnselectIcon } = props;

  const isPolkadotUnifiedAddress = useIsPolkadotUnifiedAddress({ slug: chainSlug, address });

  const formatedAdddress = useMemo(() => {
    return (isPolkadotUnifiedAddress ? reformatAddress(address, UNIFIED_CHAIN_SS58_PREFIX) : address);
  }, []);

  const _onClickInfoButton: React.MouseEventHandler<HTMLDivElement> = React.useCallback((event) => {
    event.stopPropagation();
    onClickInfoButton?.();
  }, [onClickInfoButton]);

  return (
    <div
      className={CN(className)}
      onClick={isPolkadotUnifiedAddress ? _onClickInfoButton : onClick}
    >
      <div className='__item-left-part'>
        <AccountProxyAvatar
          className={'__avatar'}
          size={24}
          value={avatarValue}
        />
      </div>

      <div className='__item-center-part'>
        {
          !!name && (
            <div className='__name'>
              {name}
            </div>
          )
        }

        <div className='__address'>
          {name ? `(${toShort(formatedAdddress, 4, 5)})` : toShort(formatedAdddress, 9, 10)}
        </div>
      </div>

      <div className='__item-right-part'>
        {(isSelected || showUnselectIcon) && (
          <div className={CN('__checked-icon-wrapper', {
            '-selected': isSelected
          })}
          >
            <Icon
              phosphorIcon={CheckCircle}
              size='sm'
              weight='fill'
            />
          </div>
        )}
      </div>
    </div>
  );
}

const AddressSelectorItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    background: token.colorBgSecondary,
    paddingLeft: token.paddingSM,
    paddingRight: token.paddingSM,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: token.borderRadiusLG,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    transition: `background ${token.motionDurationMid} ease-in-out`,
    overflowX: 'hidden',
    minHeight: 52,

    '.__avatar': {
      marginRight: token.marginSM
    },

    '.__item-center-part': {
      display: 'flex',
      overflowX: 'hidden',
      'white-space': 'nowrap',
      gap: token.sizeXXS,
      flex: 1,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.__item-right-part': {
      display: 'flex'
    },

    '.__checked-icon-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      minWidth: 40,
      marginRight: -token.marginXS,
      color: token.colorTextLight4,

      '&.-selected': {
        color: token.colorSuccess
      }
    },

    '.__name': {
      color: token.colorTextLight1,
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },

    '.__address': {
      color: token.colorTextLight4
    },

    '&:hover': {
      background: token.colorBgInput
    }
  };
});

export default AddressSelectorItem;
