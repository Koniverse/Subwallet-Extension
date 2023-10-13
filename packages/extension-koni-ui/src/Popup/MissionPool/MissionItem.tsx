// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { MissionInfo } from '@subwallet/extension-koni-ui/types/missionPool';
import { customFormatDate, openInNewTab } from '@subwallet/extension-koni-ui/utils';
import { Button, ButtonProps, Icon, Image, Number, Tag } from '@subwallet/react-ui';
import capitalize from '@subwallet/react-ui/es/_util/capitalize';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import CN from 'classnames';
import { Coin, DiceSix, GlobeHemisphereWest, MagicWand, PlusCircle, SelectionBackground, TwitterLogo, User } from 'phosphor-react';
import { IconWeight } from 'phosphor-react/src/lib';
import React, { Context, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { ThemeContext } from 'styled-components';

type Props = ThemeProps & {
  data: MissionInfo,
  onClick: (data: MissionInfo) => void
};

enum TagType {
  FCFS='fcfs',
  POINTS='points',
  LUCKY_DRAW='lucky_draw',
  MANUAL_SELECTION='manual_selection'
}

type TagInfo = {
  theme: string,
  name: string,
  slug: string,
  icon: SwIconProps['phosphorIcon'],
  iconWeight?: IconWeight
}

function Component (props: Props): React.ReactElement<Props> {
  const { className, data, onClick } = props;
  const { t } = useTranslation();
  const logoMap = useContext<Theme>(ThemeContext as Context<Theme>).logoMap;

  const timeline = useMemo<string>(() => {
    if (!data.start_time && !data.end_time) {
      return t('TBD');
    }

    const start = data.start_time ? customFormatDate(new Date(data.start_time), '#DD# #DDD# #YYYY#') : t('TBD');
    const end = data.end_time ? customFormatDate(new Date(data.end_time), '#DD# #DDD# #YYYY#') : t('TBD');

    return `${start} - ${end}`;
  }, [data.end_time, data.start_time, t]);

  const onClickGlobalIcon: ButtonProps['onClick'] = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    data.campaign_url && openInNewTab(data.campaign_url)();
  }, [data.campaign_url]);

  const onClickTwitterIcon: ButtonProps['onClick'] = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    data.twitter_url && openInNewTab(data.twitter_url)();
  }, [data.twitter_url]);

  const onClickJoinNow: ButtonProps['onClick'] = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    data.url && openInNewTab(data.url)();
  }, [data.url]);

  const onClickContainer = useCallback(() => {
    onClick(data);
  }, [data, onClick]);

  const tagMap = useMemo<Record<string, TagInfo>>(() => {
    return {
      [TagType.FCFS]: {
        theme: 'yellow',
        name: t('FCFS'),
        slug: TagType.FCFS,
        icon: User
      },
      [TagType.POINTS]: {
        theme: 'success',
        name: t('Points'),
        slug: TagType.POINTS,
        icon: Coin,
        iconWeight: 'fill'
      },
      [TagType.LUCKY_DRAW]: {
        theme: 'gold',
        name: t('Lucky draw'),
        slug: TagType.LUCKY_DRAW,
        icon: DiceSix,
        iconWeight: 'fill'
      },
      [TagType.MANUAL_SELECTION]: {
        theme: 'blue',
        name: t('Manual selection'),
        slug: TagType.MANUAL_SELECTION,
        icon: SelectionBackground
      }
    };
  }, [t]);

  const tagNode = useMemo(() => {
    if (!data.tags || !data.tags.length) {
      return null;
    }

    const tagSlug = data.tags[0];

    const theme = tagMap[tagSlug]?.theme || 'gray';
    const name = tagMap[tagSlug]?.name || t(capitalize(tagSlug.replace('_', ' ')));
    const iconWeight = tagMap[tagSlug]?.iconWeight;
    const icon = tagMap[tagSlug]?.icon || MagicWand;

    return (
      <Tag
        className='__item-tag'
        color={theme}
      >
        <Icon
          className={'__item-tag-icon'}
          customSize={'12px'}
          phosphorIcon={icon}
          weight={iconWeight}
        />
        {name}
      </Tag>
    );
  }, [data.tags, t, tagMap]);

  return (
    <div
      className={CN(className)}
      onClick={onClickContainer}
    >
      <div
        className='__item-background'
        style={{ backgroundImage: data.backdrop_image ? `url("${data.backdrop_image}")` : undefined }}
      ></div>

      <div className={'__item-inner'}>
        <div
          className='__item-logo'
        >
          <Image
            height={'100%'}
            src={data.logo || logoMap.default as string}
            width={'100%'}
          />
        </div>
        <div className='__item-name'>
          {data.name || ''}
        </div>
        <div className={'__item-rewards __item-value-row'}>
          <div className='__item-label'>{t('Rewards')}:</div>
          <div className='__item-value'>
            <Number
              decimal={0}
              decimalOpacity={0.45}
              prefix={'$'}
              value={data.reward || '0'}
            />
          </div>
        </div>
        <div className={'__item-description'}>
          {data.description || ''}
        </div>
        <div className={'__item-timeline __item-value-row'}>
          <div className='__item-label'>{t('Timeline')}:</div>
          <div className='__item-value'>{timeline}</div>
        </div>
        <div className={'__item-tags'}>
          {tagNode}
        </div>
        <div className={'__item-buttons'}>
          <Button
            className={'__item-icon-button'}
            icon={(
              <Icon
                phosphorIcon={GlobeHemisphereWest}
                size={'sm'}
                weight={'fill'}
              />
            )}
            onClick={onClickGlobalIcon}
            size={'xs'}
            type='ghost'
          />
          <Button
            className={'__item-icon-button'}
            icon={(
              <Icon
                phosphorIcon={TwitterLogo}
                size={'sm'}
                weight={'fill'}
              />
            )}
            onClick={onClickTwitterIcon}
            size={'xs'}
            type='ghost'
          />
          <Button
            className={'__item-join-now-button'}
            icon={(
              <Icon
                phosphorIcon={PlusCircle}
                size={'sm'}
                weight={'fill'}
              />
            )}
            onClick={onClickJoinNow}
            shape={'circle'}
            size={'xs'}
          >
            {t('Join now')}
          </Button>
        </div>
      </div>
    </div>
  );
}

const MissionItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadiusLG,
    position: 'relative',

    '.ant-number .ant-typography': {
      fontSize: 'inherit !important',
      fontWeight: 'inherit !important',
      color: 'inherit !important',
      lineHeight: 'inherit'
    },

    '.__item-background': {
      height: 70,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      position: 'absolute',
      top: 0,
      left: 0,
      filter: 'blur(7.5px)',
      right: 0
    },

    '.__item-inner': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: token.paddingXL,
      paddingLeft: token.padding,
      paddingRight: token.padding,
      position: 'relative',
      zIndex: 5
    },

    '.__item-value-row': {
      display: 'flex',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.headingFontWeight,
      gap: token.sizeXXS
    },

    '.__item-label': {
      color: token.colorTextLight4
    },

    '.__item-value': {
      color: token.colorSuccess
    },

    '.__item-logo': {
      width: 64,
      height: 64,
      marginBottom: token.margin
    },

    '.__item-name': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      color: token.colorTextLight1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      'white-space': 'nowrap',
      fontWeight: token.headingFontWeight,
      marginBottom: token.marginXS,
      minHeight: 28
    },

    '.__item-rewards': {
      marginBottom: token.marginXS
    },

    '.__item-description': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextLight3,
      display: '-webkit-box',
      '-webkit-line-clamp': '2',
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
      marginBottom: token.margin,
      textAlign: 'center',
      minHeight: 40
    },

    '.__item-timeline': {
      marginBottom: token.margin
    },

    '.__item-tags': {
      minHeight: 22,
      marginBottom: token.margin
    },

    '.__item-tag': {
      display: 'flex',
      gap: token.sizeXXS
    },

    '.__item-buttons': {
      gap: token.size,
      paddingTop: token.paddingLG,
      display: 'flex'
    },

    '.__item-icon-button': {
      borderRadius: '100%',
      border: '2px solid',
      borderColor: token.colorBgBorder
    },

    '.__item-join-now-button': {
      '.anticon': {
        height: 20,
        width: 20
      }
    }
  };
});

export default MissionItem;
