// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { APIItemState, NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { EarningRewardItem, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { AlertModal, BaseModal, EarningInstructionModal, EarningPositionDesktopItem, EarningPositionItem, EmptyList, FilterModal, Layout } from '@subwallet/extension-web-ui/components';
import { FilterTabsNode } from '@subwallet/extension-web-ui/components/FilterTabsNode';
import BannerGenerator from '@subwallet/extension-web-ui/components/StaticContent/BannerGenerator';
import { ASTAR_PORTAL_URL, BN_TEN, CANCEL_UN_STAKE_TRANSACTION, CLAIM_REWARD_TRANSACTION, DEFAULT_CANCEL_UN_STAKE_PARAMS, DEFAULT_CLAIM_REWARD_PARAMS, DEFAULT_EARN_PARAMS, DEFAULT_UN_STAKE_PARAMS, DEFAULT_WITHDRAW_PARAMS, EARN_TRANSACTION, EARNING_INSTRUCTION_MODAL, EARNING_WARNING_ANNOUNCEMENT, TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL, TRANSACTION_YIELD_CLAIM_MODAL, TRANSACTION_YIELD_UNSTAKE_MODAL, TRANSACTION_YIELD_WITHDRAW_MODAL, UN_STAKE_TRANSACTION, WITHDRAW_TRANSACTION } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { useAlert, useFilterModal, useGetBannerByScreen, useGetYieldPositionForSpecificAccount, useSelector, useTranslation } from '@subwallet/extension-web-ui/hooks';
import { reloadCron } from '@subwallet/extension-web-ui/messaging';
import EarningPositionBalance from '@subwallet/extension-web-ui/Popup/Home/Earning/EarningEntry/EarningPositions/EarningPositionsBalance';
import { Toolbar } from '@subwallet/extension-web-ui/Popup/Home/Earning/shared/desktop/Toolbar';
import Transaction from '@subwallet/extension-web-ui/Popup/Transaction/Transaction';
import CancelUnstake from '@subwallet/extension-web-ui/Popup/Transaction/variants/CancelUnstake';
import ClaimReward from '@subwallet/extension-web-ui/Popup/Transaction/variants/ClaimReward';
import Unbond from '@subwallet/extension-web-ui/Popup/Transaction/variants/Unbond';
import Withdraw from '@subwallet/extension-web-ui/Popup/Transaction/variants/Withdraw';
import { EarningEntryView, EarningPositionDetailParam, ExtraYieldPositionInfo, Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { getTransactionFromAccountProxyValue, isAccountAll, isRelatedToAstar, openInNewTab } from '@subwallet/extension-web-ui/utils';
import { Button, ButtonProps, Icon, ModalContext, SwIconProps, SwList } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { ArrowsClockwise, Database, FadersHorizontal, HandsClapping, Leaf, Plus, PlusCircle, SquaresFour, Users, Vault } from 'phosphor-react';
import { IconWeight } from 'phosphor-react/src/lib';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps & {
  earningPositions: YieldPositionInfo[];
  setEntryView: React.Dispatch<React.SetStateAction<EarningEntryView>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

type FilterTabItemType = {
  label: string,
  value: string,
  icon: SwIconProps['phosphorIcon'],
  iconColor: string,
  weight?: IconWeight,
}

enum FilterValue {
  ALL = 'ALL',
  NOMINATION_POOL = 'NOMINATION_POOL',
  DIRECT_NOMINATION = 'NATIVE_STAKING',
  LIQUID_STAKING = 'LIQUID_STAKING',
  LENDING = 'LENDING'
}

const FILTER_MODAL_ID = 'earning-positions-filter-modal';
const alertModalId = 'earning-positions-alert-modal';
const instructionModalId = EARNING_INSTRUCTION_MODAL;

function Component ({ className, earningPositions, setEntryView, setLoading }: Props) {
  const { t } = useTranslation();
  const { isWebUI } = useContext(ScreenContext);
  const navigate = useNavigate();

  const { activeModal } = useContext(ModalContext);

  const isShowBalance = useSelector((state) => state.settings.isShowBalance);
  const { currencyData, priceMap } = useSelector((state) => state.price);
  const { assetRegistry: assetInfoMap } = useSelector((state) => state.assetRegistry);
  const chainInfoMap = useSelector((state) => state.chainStore.chainInfoMap);
  const accounts = useSelector((state) => state.accountState.accounts);
  const isAllAccount = useSelector((state) => state.accountState.isAllAccount);
  const currentAccountProxy = useSelector((state) => state.accountState.currentAccountProxy);
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);
  const poolInfoMap = useSelector((state) => state.earning.poolInfoMap);
  const earningRewards = useSelector((state) => state.earning.earningRewards);
  const assetRegistry = useSelector((state) => state.assetRegistry.assetRegistry);
  const { banners, dismissBanner, onClickBanner } = useGetBannerByScreen('earning');

  const [, setEarnStorage] = useLocalStorage(EARN_TRANSACTION, DEFAULT_EARN_PARAMS);
  const [, setUnStakeStorage] = useLocalStorage(UN_STAKE_TRANSACTION, DEFAULT_UN_STAKE_PARAMS);
  const [, setClaimRewardStorage] = useLocalStorage(CLAIM_REWARD_TRANSACTION, DEFAULT_CLAIM_REWARD_PARAMS);
  const [, setWithdrawStorage] = useLocalStorage(WITHDRAW_TRANSACTION, DEFAULT_WITHDRAW_PARAMS);
  const [, setCancelUnStakeStorage] = useLocalStorage(CANCEL_UN_STAKE_TRANSACTION, DEFAULT_CANCEL_UN_STAKE_PARAMS);
  const [announcement, setAnnouncement] = useLocalStorage(EARNING_WARNING_ANNOUNCEMENT, 'nonConfirmed');
  const specificList = useGetYieldPositionForSpecificAccount();

  const { inactiveModal } = useContext(ModalContext);

  const { token } = useTheme() as Theme;

  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(FilterValue.ALL);
  const [selectedPositionInfo, setSelectedPositionInfo] = useState<ExtraYieldPositionInfo | undefined>(undefined);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    return [
      {
        label: t('All'),
        value: FilterValue.ALL,
        icon: SquaresFour,
        iconColor: token.geekblue,
        weight: 'fill'
      },
      {
        label: t('Nomination pool'),
        value: FilterValue.NOMINATION_POOL,
        icon: Users,
        iconColor: token['colorSuccess-6']

      },
      {
        label: t('Direct nomination'),
        value: FilterValue.DIRECT_NOMINATION,
        icon: Database,
        iconColor: token['gold-6'],
        weight: 'fill'
      },
      {
        label: t('Liquid staking'),
        value: FilterValue.LIQUID_STAKING,
        icon: Leaf,
        iconColor: token['magenta-6'],
        weight: 'fill'
      },
      {
        label: t('Lending'),
        value: FilterValue.LENDING,
        icon: HandsClapping,
        iconColor: token['green-6']
      }
    ];
  }, [t, token]);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  const items: ExtraYieldPositionInfo[] = useMemo(() => {
    if (!earningPositions.length) {
      return [];
    }

    return earningPositions
      .map((item): ExtraYieldPositionInfo => {
        const priceToken = assetInfoMap[item.balanceToken];
        const price = priceMap[priceToken?.priceId || ''] || 0;

        return {
          ...item,
          asset: priceToken,
          price,
          currency: currencyData
        };
      })
      .sort((firstItem, secondItem) => {
        const getValue = (item: ExtraYieldPositionInfo): number => {
          return new BigN(item.totalStake)
            .dividedBy(BN_TEN.pow(item.asset.decimals || 0))
            .multipliedBy(item.price)
            .toNumber();
        };

        return getValue(secondItem) - getValue(firstItem);
      });
  }, [assetInfoMap, currencyData, earningPositions, priceMap]);

  const chainStakingBoth = useMemo(() => {
    if (!currentAccountProxy) {
      return null;
    }

    const chains = ['polkadot', 'kusama'];

    const findChainWithStaking = (list: YieldPositionInfo[]) => {
      const hasNativeStaking = (chain: string) => list.some((item) => item.chain === chain && item.type === YieldPoolType.NATIVE_STAKING);
      const hasNominationPool = (chain: string) => list.some((item) => item.chain === chain && item.type === YieldPoolType.NOMINATION_POOL);

      for (const chain of chains) {
        if (hasNativeStaking(chain) && hasNominationPool(chain)) {
          return chain;
        }
      }

      return null;
    };

    if (isAccountAll(currentAccountProxy.id)) {
      return findChainWithStaking(specificList);
    }

    for (const acc of accounts) {
      if (isAccountAll(acc.address)) {
        continue;
      }

      const listStaking = specificList.filter((item) => item.address === acc.address);
      const chain = findChainWithStaking(listStaking);

      if (chain) {
        return chain;
      }
    }

    return null;
  }, [accounts, currentAccountProxy, specificList]);

  const learnMore = useCallback(() => {
    window.open('https://support.polkadot.network/support/solutions/articles/65000188140-changes-for-nomination-pool-members-and-opengov-participation');
  }, []);

  const onCancel = useCallback(() => {
    closeAlert();
    setAnnouncement('confirmed');
  }, [closeAlert, setAnnouncement]);

  useEffect(() => {
    if (chainStakingBoth && announcement.includes('nonConfirmed')) {
      const chainInfo = chainStakingBoth && chainInfoMap[chainStakingBoth];

      const symbol = (!!chainInfo && chainInfo?.substrateInfo?.symbol) || '';
      const originChain = (!!chainInfo && chainInfo?.name) || '';

      openAlert({
        type: NotificationType.WARNING,
        onCancel: onCancel,
        content:
          (<>
            <div className={CN(className, 'earning-alert-content')}>
              <span>{t('You’re dual staking via both direct nomination and nomination pool, which')}&nbsp;</span>
              <span className={'__info-highlight'}>{t('will not be supported')}&nbsp;</span>
              <span>{t(`in the upcoming ${originChain} runtime upgrade. Read more to learn about the upgrade, and`)}&nbsp;</span>
              <a
                href={'https://docs.subwallet.app/main/mobile-app-user-guide/manage-staking/unstake'}
                rel='noreferrer'
                style={{ textDecoration: 'underline' }}
                target={'_blank'}
              >{(`unstake your ${symbol}`)}
              </a>
              <span>&nbsp;{t('from one of the methods to avoid issues')}</span>
            </div>

          </>),
        title: t(`Unstake your ${symbol} now!`),
        okButton: {
          text: t('Read update'),
          onClick: () => {
            learnMore();
            setAnnouncement('confirmed');
            closeAlert();
          }
        },
        cancelButton: {
          text: t('Dismiss'),
          onClick: () => {
            closeAlert();
            setAnnouncement('confirmed');
          }
        }
      });
    }
  }, [announcement, chainInfoMap, chainStakingBoth, className, closeAlert, learnMore, onCancel, openAlert, setAnnouncement, t]);

  const filterOptions = [
    { label: t('Nomination pool'), value: YieldPoolType.NOMINATION_POOL },
    { label: t('Direct nomination'), value: YieldPoolType.NATIVE_STAKING },
    { label: t('Liquid staking'), value: YieldPoolType.LIQUID_STAKING },
    { label: t('Lending'), value: YieldPoolType.LENDING },
    { label: t('Parachain staking'), value: YieldPoolType.PARACHAIN_STAKING },
    { label: t('Single farming'), value: YieldPoolType.SINGLE_FARMING }
  ];

  const filterFunction = useMemo<(items: ExtraYieldPositionInfo) => boolean>(() => {
    return (item) => {
      if (!selectedFilters.length) {
        return true;
      }

      for (const filter of selectedFilters) {
        if (filter === '') {
          return true;
        }

        if (filter === YieldPoolType.NOMINATION_POOL && item.type === YieldPoolType.NOMINATION_POOL) {
          return true;
        } else if (filter === YieldPoolType.NATIVE_STAKING && item.type === YieldPoolType.NATIVE_STAKING) {
          return true;
        } else if (filter === YieldPoolType.LIQUID_STAKING && item.type === YieldPoolType.LIQUID_STAKING) {
          return true;
        } else if (filter === YieldPoolType.LENDING && item.type === YieldPoolType.LENDING) {
          return true;
        }
        // Uncomment the following code block if needed
        // else if (filter === YieldPoolType.PARACHAIN_STAKING && item.type === YieldPoolType.PARACHAIN_STAKING) {
        //   return true;
        // } else if (filter === YieldPoolType.SINGLE_FARMING && item.type === YieldPoolType.SINGLE_FARMING) {
        //   return true;
        // }
      }

      return false;
    };
  }, [selectedFilters]);

  const onClickCancelUnStakeButton = useCallback((item: ExtraYieldPositionInfo) => {
    return () => {
      setSelectedPositionInfo(item);
      setCancelUnStakeStorage({
        ...DEFAULT_CANCEL_UN_STAKE_PARAMS,
        slug: item.slug,
        chain: item.chain,
        fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
      });

      activeModal(TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL);
    };
  }, [activeModal, currentAccountProxy, setCancelUnStakeStorage]);

  const onClickClaimButton = useCallback((item: ExtraYieldPositionInfo) => {
    return () => {
      const isDAppStaking = _STAKING_CHAIN_GROUP.astar.includes(item.chain);

      if (item.type === YieldPoolType.NATIVE_STAKING && isDAppStaking) {
        openInNewTab('https://portal.astar.network/astar/dapp-staking/discover')();

        return;
      }

      setSelectedPositionInfo(item);
      setClaimRewardStorage({
        ...DEFAULT_CLAIM_REWARD_PARAMS,
        slug: item.slug,
        chain: item.chain,
        fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
      });

      activeModal(TRANSACTION_YIELD_CLAIM_MODAL);
    };
  }, [activeModal, currentAccountProxy, setClaimRewardStorage]);

  const onClickStakeButton = useCallback((item: ExtraYieldPositionInfo) => {
    return () => {
      setSelectedPositionInfo(item);
      setEarnStorage({
        ...DEFAULT_EARN_PARAMS,
        slug: item.slug,
        chain: item.chain,
        fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
      });

      navigate('/transaction/earn');
    };
  }, [currentAccountProxy, navigate, setEarnStorage]);

  const navigateToEarnTransaction = useCallback(
    (slug: string, chain: string) => {
      setEarnStorage({
        ...DEFAULT_EARN_PARAMS,
        slug,
        chain,
        fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
      });
      navigate('/transaction/earn');
    },
    [currentAccountProxy, navigate, setEarnStorage]
  );

  const onClickUnStakeButton = useCallback((item: ExtraYieldPositionInfo) => {
    return () => {
      setSelectedPositionInfo(item);
      setUnStakeStorage({
        ...DEFAULT_UN_STAKE_PARAMS,
        slug: item.slug,
        chain: item.chain,
        fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
      });

      activeModal(TRANSACTION_YIELD_UNSTAKE_MODAL);
    };
  }, [activeModal, currentAccountProxy, setUnStakeStorage]);

  const onClickInstructionButton = useCallback((item: ExtraYieldPositionInfo) => {
    return () => {
      setSelectedPositionInfo(item);
      activeModal(instructionModalId);
    };
  }, [activeModal]);

  const onClickWithdrawButton = useCallback((item: ExtraYieldPositionInfo) => {
    return () => {
      if (item.type === YieldPoolType.LENDING) {
        onClickUnStakeButton(item)();

        return;
      }

      setSelectedPositionInfo(item);
      setWithdrawStorage({
        ...DEFAULT_WITHDRAW_PARAMS,
        slug: item.slug,
        chain: item.chain,
        fromAccountProxy: getTransactionFromAccountProxyValue(currentAccountProxy)
      });

      activeModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
    };
  }, [activeModal, currentAccountProxy, onClickUnStakeButton, setWithdrawStorage]);

  const onClickItem = useCallback((item: ExtraYieldPositionInfo) => {
    return () => {
      if (isRelatedToAstar(item.slug)) {
        openAlert({
          title: t('Enter Astar portal'),
          content: t('You are navigating to Astar portal to view and manage your stake in Astar dApp staking v3. SubWallet will offer support for Astar dApp staking v3 soon.'),
          cancelButton: {
            text: t('Cancel'),
            schema: 'secondary',
            onClick: closeAlert
          },
          okButton: {
            text: t('Enter Astar portal'),
            onClick: () => {
              openInNewTab(ASTAR_PORTAL_URL)();
              closeAlert();
            }
          }
        });
      } else {
        navigate('/home/earning/position-detail', { state: {
          earningSlug: item.slug
        } as EarningPositionDetailParam });
      }
    };
  }, [closeAlert, navigate, openAlert, t]);

  const renderItem = useCallback((item: ExtraYieldPositionInfo) => {
    if (!isWebUI) {
      return (
        <EarningPositionItem
          className={'earning-position-item'}
          isShowBalance={isShowBalance}
          key={item.slug}
          onClick={onClickItem(item)}
          positionInfo={item}
        />
      );
    }

    const poolInfo = poolInfoMap[item.slug];
    const key = [item.slug, item.address].join('-');

    if (!poolInfo) {
      return null;
    }

    let nominationPoolReward: EarningRewardItem | undefined;

    if (isAllAccount) {
      nominationPoolReward = {
        state: APIItemState.READY,
        chain: poolInfo.chain,
        slug: poolInfo.slug,
        group: poolInfo.group,
        address: ALL_ACCOUNT_KEY,
        type: YieldPoolType.NOMINATION_POOL
      } as EarningRewardItem;

      earningRewards.forEach((earningReward: EarningRewardItem) => {
        if (nominationPoolReward && earningReward.chain === poolInfo.chain && earningReward.type === YieldPoolType.NOMINATION_POOL) {
          const bnUnclaimedReward = new BigN(earningReward.unclaimedReward || '0');

          nominationPoolReward.unclaimedReward = bnUnclaimedReward.plus(nominationPoolReward.unclaimedReward || '0').toString();
        }
      });
    } else {
      nominationPoolReward = earningRewards.find((rewardItem) => rewardItem.address === item?.address && rewardItem.chain === poolInfo?.chain && rewardItem.type === YieldPoolType.NOMINATION_POOL);
    }

    return (
      <EarningPositionDesktopItem
        className={'earning-position-desktop-item'}
        isShowBalance={isShowBalance}
        key={key}
        onClickCancelUnStakeButton={onClickCancelUnStakeButton(item)}
        onClickClaimButton={onClickClaimButton(item)}
        onClickInstructionButton={onClickInstructionButton(item)}
        onClickItem={onClickItem(item)}
        onClickStakeButton={onClickStakeButton(item)}
        onClickUnStakeButton={onClickUnStakeButton(item)}
        onClickWithdrawButton={onClickWithdrawButton(item)}
        poolInfo={poolInfo}
        positionInfo={item}
        unclaimedReward={nominationPoolReward?.unclaimedReward}
      />
    );
  }, [isWebUI, poolInfoMap, isAllAccount, isShowBalance, onClickCancelUnStakeButton, onClickClaimButton, onClickInstructionButton, onClickItem, onClickStakeButton, onClickUnStakeButton, onClickWithdrawButton, earningRewards]);

  const emptyList = useCallback(() => {
    return (
      <EmptyList
        buttonProps={{
          icon: (
            <Icon
              phosphorIcon={PlusCircle}
              weight={'fill'}
            />),
          onClick: () => {
            setEntryView(EarningEntryView.OPTIONS);
          },
          size: 'xs',
          shape: 'circle',
          children: t('Explore earning options')
        }}
        className={'__empty-list-earning-positions'}
        emptyMessage={t('Change your search or explore other earning options')}
        emptyTitle={t('No earning position found')}
        phosphorIcon={Vault}
      />
    );
  }, [setEntryView, t]);

  const searchFunction = useCallback(({ balanceToken, chain: _chain }: ExtraYieldPositionInfo, searchText: string) => {
    const chainInfo = chainInfoMap[_chain];
    const assetInfo = assetInfoMap[balanceToken];

    return (
      chainInfo?.name.replace(' Relay Chain', '').toLowerCase().includes(searchText.toLowerCase()) ||
      assetInfo?.symbol.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [assetInfoMap, chainInfoMap]);

  const subHeaderButtons: ButtonProps[] = useMemo(() => {
    return [
      {
        icon: (
          <Icon
            phosphorIcon={ArrowsClockwise}
            size='sm'
            type='phosphor'
          />
        ),
        onClick: () => {
          setLoading(true);
          reloadCron({ data: 'staking' })
            .catch(console.error).finally(() => {
              setTimeout(() => {
                setLoading(false);
              }, 3000);
            });
        }
      },
      {
        icon: (
          <Icon
            phosphorIcon={Plus}
            size='sm'
            type='phosphor'
          />
        ),
        onClick: () => {
          setEntryView(EarningEntryView.OPTIONS);
        }
      }
    ];
  }, [setEntryView, setLoading]);

  const handleCloseUnstake = useCallback(() => {
    inactiveModal(TRANSACTION_YIELD_UNSTAKE_MODAL);
  }, [inactiveModal]);

  const handleCloseClaim = useCallback(() => {
    inactiveModal(TRANSACTION_YIELD_CLAIM_MODAL);
  }, [inactiveModal]);

  const handleCloseCancelUnstake = useCallback(() => {
    inactiveModal(TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL);
  }, [inactiveModal]);

  const onClickFilterButton = useCallback(
    (e?: SyntheticEvent) => {
      e && e.stopPropagation();
      activeModal(FILTER_MODAL_ID);
    },
    [activeModal]
  );
  const handleCloseWithdraw = useCallback(() => {
    inactiveModal(TRANSACTION_YIELD_WITHDRAW_MODAL);
  }, [inactiveModal]);

  const addMore = useCallback(() => {
    setEntryView(EarningEntryView.OPTIONS);
  }, [setEntryView]);

  const filteredItems = useMemo(() => {
    const filterTabFunction = (item: ExtraYieldPositionInfo) => {
      if (selectedFilterTab === FilterValue.ALL) {
        return true;
      }

      return item.type === selectedFilterTab;
    };

    const _filterFunction = (_item: ExtraYieldPositionInfo) => {
      return filterTabFunction(_item) && filterFunction(_item) && searchFunction(_item, searchInput);
    };

    return items.filter(_filterFunction);
  }, [items, filterFunction, searchFunction, searchInput, selectedFilterTab]);

  return (
    <>
      <Layout.Base
        className={CN(className, { '-mobile-mode': !isWebUI })}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={false}
        subHeaderIcons={subHeaderButtons}
        subHeaderPaddingVertical={true}
        title={t<string>('Your earning positions')}
      >
        {
          isWebUI
            ? (
              <>
                <EarningPositionBalance items={items} />
                <div className={'earning-position-banner-wrapper'}>
                  {!!banners.length && (<BannerGenerator
                    banners={banners}
                    dismissBanner={dismissBanner}
                    onClickBanner={onClickBanner}
                  />)}
                </div>
                <div className={'action-wrapper'}>
                  <FilterTabsNode
                    className={'filter-tabs-container'}
                    items={filterTabItems}
                    onSelect={onSelectFilterTab}
                    selectedItem={selectedFilterTab}
                  />
                  <Toolbar
                    className={'__desktop-toolbar'}
                    extraActionNode={
                      subHeaderButtons.map((b, index) => (
                        <Button
                          {...b}
                          key={index}
                          size={'xs'}
                          type={'ghost'}
                        />
                      ))
                    }
                    inputPlaceholder={t<string>('Search token')}
                    onClickFilter={onClickFilterButton}
                    onSearch={setSearchInput}
                    searchValue={searchInput}
                  />
                  <Button
                    className={'__filter-button'}
                    icon={(
                      <Icon
                        phosphorIcon={FadersHorizontal}
                        size='sm'
                      />
                    )}
                    onClick={onClickFilterButton}
                    size={'xs'}
                    type={'ghost'}
                  >
                  </Button>
                </div>
                <SwList
                  className={'__desktop-list-container'}
                  filterBy={filterFunction}
                  list={filteredItems}
                  renderItem={renderItem}
                  renderWhenEmpty={emptyList}
                  searchBy={searchFunction}
                  searchMinCharactersCount={1}
                  searchTerm={searchInput}
                />
              </>
            )
            : (
              <>
                <EarningPositionBalance items={items} />
                <SwList.Section
                  actionBtnIcon={<Icon phosphorIcon={FadersHorizontal} />}
                  className={'__section-list-container'}
                  enableSearchInput
                  filterBy={filterFunction}
                  list={items}
                  onClickActionBtn={onClickFilterButton}
                  renderItem={renderItem}
                  renderWhenEmpty={emptyList}
                  searchFunction={searchFunction}
                  searchMinCharactersCount={1}
                  searchPlaceholder={t<string>('Search token')}
                  showActionBtn
                />
              </>
            )
        }
        <div className={'footer-separator'}></div>
        <div className='footer-group'>
          <div className='footer-left'>
            <Icon
              iconColor='var(--icon-color)'
              phosphorIcon={PlusCircle}
              size='md'
              weight='fill'
            />
            <span className='footer-content'>{t('Do you want to add more funds or add funds to other pools')}</span>
          </div>
          <Button
            icon={(
              <Icon
                phosphorIcon={Vault}
                size='sm'
                weight='fill'
              />
            )}
            onClick={addMore}
            shape='circle'
            size='xs'
          >
            {t('Add more fund')}
          </Button>
        </div>

        <FilterModal
          applyFilterButtonTitle={t('Apply filter')}
          id={FILTER_MODAL_ID}
          onApplyFilter={onApplyFilter}
          onCancel={onCloseFilterModal}
          onChangeOption={onChangeFilterOption}
          optionSelectionMap={filterSelectionMap}
          options={filterOptions}
          title={t('Filter')}
        />
      </Layout.Base>

      <BaseModal
        className={'right-side-modal'}
        destroyOnClose={true}
        id={TRANSACTION_YIELD_UNSTAKE_MODAL}
        onCancel={handleCloseUnstake}
        title={selectedPositionInfo?.type === YieldPoolType.LENDING ? t('Withdraw') : t('Unstake')}
      >
        <Transaction
          modalContent={isWebUI}
          modalId={TRANSACTION_YIELD_UNSTAKE_MODAL}
        >
          <Unbond />
        </Transaction>
      </BaseModal>
      <BaseModal
        className={'right-side-modal'}
        destroyOnClose={true}
        id={TRANSACTION_YIELD_CLAIM_MODAL}
        onCancel={handleCloseClaim}
        title={t('Claim rewards')}
      >
        <Transaction
          modalContent={isWebUI}
          modalId={TRANSACTION_YIELD_CLAIM_MODAL}
        >
          <ClaimReward />
        </Transaction>
      </BaseModal>
      <BaseModal
        className={'right-side-modal'}
        destroyOnClose={true}
        id={TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL}
        onCancel={handleCloseCancelUnstake}
        title={t('Cancel unstake')}
      >
        <Transaction
          modalContent={isWebUI}
          modalId={TRANSACTION_YIELD_CANCEL_UNSTAKE_MODAL}
        >
          <CancelUnstake />
        </Transaction>
      </BaseModal>
      <BaseModal
        className={'right-side-modal'}
        destroyOnClose={true}
        id={TRANSACTION_YIELD_WITHDRAW_MODAL}
        onCancel={handleCloseWithdraw}
        title={t('Withdraw')}
      >
        <Transaction
          modalContent={isWebUI}
          modalId={TRANSACTION_YIELD_WITHDRAW_MODAL}
        >
          <Withdraw />
        </Transaction>
      </BaseModal>
      {
        !!(selectedPositionInfo && poolInfoMap[selectedPositionInfo.slug]) &&
        (
          <EarningInstructionModal
            assetRegistry={assetRegistry}
            bypassEarlyValidate={true}
            closeAlert={closeAlert}
            customButtonTitle={selectedPositionInfo.type === YieldPoolType.LENDING ? t('Supply more') : t('Stake more')}
            isShowStakeMoreButton={true}
            onStakeMore={navigateToEarnTransaction}
            openAlert={openAlert}
            poolInfo={poolInfoMap[selectedPositionInfo.slug]}
          />
        )
      }

      {
        !!alertProps && (
          <AlertModal
            modalId={alertModalId}
            {...alertProps}
          />
        )
      }
    </>
  );
}

const EarningPositions = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  overflow: 'auto',
  flex: 1,
  width: '100%',
  alignSelf: 'center',
  display: 'flex',
  flexDirection: 'column',

  '.ant-sw-sub-header-container': {
    marginBottom: token.marginXS
  },

  '.__filter-button': {
    display: 'none'
  },

  '.__section-list-container': {
    paddingLeft: 0,
    paddingRight: 0,
    height: '100%',
    flex: 1
  },
  '.footer-separator': {
    height: 2,
    backgroundColor: token.colorSplit,
    marginBottom: token.marginSM
  },

  '.__empty-list-earning-positions': {
    height: '100%',
    marginBottom: 0,
    marginTop: 0
  },

  '.__desktop-list-container': {
    paddingLeft: 0,
    paddingRight: 0,
    display: 'flex',
    gap: 16,
    flexDirection: 'column',
    overflowY: 'auto',
    flex: 1,
    height: '100%'
  },

  '.earning-position-item': {
    '+ .earning-position-item': {
      marginTop: token.marginXS
    }
  },

  // desktop

  '&.earning-alert-content': {
    display: 'contents',
    '.__info-highlight': {
      fontWeight: token.fontWeightStrong
    }
  },

  '.__desktop-toolbar': {
    marginBottom: 20
  },
  '.divider': {
    marginTop: 0,
    marginBottom: token.margin
  },

  '.footer-group': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: token.paddingXS,
    paddingBottom: token.paddingXL,

    '.footer-left': {
      '--icon-color': token['gold-6'],
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: token.sizeXS
    },

    '.footer-content': {
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      color: token.colorTextSecondary
    }
  },

  '.action-wrapper': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '.filter-tabs-container': {
      flex: 1,
      overflowX: 'auto'
    },

    '.__desktop-toolbar': {
      minWidth: 360
    }
  },

  '&.-mobile-mode': {
    '.ant-sw-sub-header-container': {
      marginBottom: 0
    }
  },

  '@media (min-width: 992px)': {
    '.__empty-list-earning-positions': {
      paddingTop: 32,
      paddingBottom: 62
    }
  },
  '@media screen and (max-width: 1305px)': {
    '.__filter-button': {
      display: 'flex',
      marginBottom: 20
    },
    '.__desktop-toolbar.__desktop-toolbar': {
      minWidth: 'fit-content'
    },
    '.__desktop-toolbar': {
      '.ant-btn-content-wrapper': {
        display: 'none'
      },
      '.ant-input-container': {
        display: 'none'
      },
      '.ant-btn:first-child': {
        padding: 0,
        minWidth: 40
      }
    }
  },
  '@media (max-width: 991px)': {
    '.ant-sw-screen-layout-body': {
      display: 'flex',
      flexDirection: 'column'
    },
    '.footer-group': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      '.footer-content': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        paddingRight: token.paddingXXS
      }
    },
    '.footer-separator': {
      marginLeft: token.margin,
      marginRight: token.margin
    },
    '.__desktop-list-container': {
      overflow: 'visible'
    }
  },
  '@media (max-width: 300px)': {
    '.footer-group .ant-btn-content-wrapper': {
      display: 'none'
    }
  }
}));

export default EarningPositions;
