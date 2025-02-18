// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _getAssetPriceId, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { FeeDetail, TransactionFee } from '@subwallet/extension-base/types';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import ChooseFeeTokenModal from '@subwallet/extension-koni-ui/components/Field/TransactionFee/FeeEditor/ChooseFeeTokenModal';
import { ASSET_HUB_CHAIN_SLUGS, BN_TEN, CHOOSE_FEE_TOKEN_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ActivityIndicator, Button, Icon, ModalContext, Number } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FeeEditorModal } from './FeeEditorModal';

export type RenderFieldNodeParams = {
  isLoading: boolean;
  feeInfo: {
    decimals: number,
    symbol: string,
    value: BigN,
    convertedValue: BigN
  },
  disableEdit: boolean,
  onClickEdit: VoidFunction
}

type Props = ThemeProps & {
  onSelect?: (option: TransactionFee) => void;
  isLoading?: boolean;
  tokenPayFeeSlug: string;
  tokenSlug: string;
  feePercentageSpecialCase?: number
  feeOptionsInfo?: FeeDetail;
  estimateFee: string;
  renderFieldNode?: (params: RenderFieldNodeParams) => React.ReactNode;
  feeType?: string;
  listTokensCanPayFee: TokenHasBalanceInfo[];
  onSetTokenPayFee: (slug: string) => void;
  currentTokenPayFee?: string;
  chainValue?: string;
  destChainValue?: string;
  selectedFeeOption?: TransactionFee;
  nativeTokenSlug: string;
};

// todo: will update dynamic later
const modalId = 'FeeEditorModalId';

const Component = ({ chainValue, className, currentTokenPayFee, destChainValue, estimateFee, feeOptionsInfo, feePercentageSpecialCase, feeType, isLoading = false, listTokensCanPayFee, nativeTokenSlug, onSelect, onSetTokenPayFee, renderFieldNode, selectedFeeOption, tokenPayFeeSlug, tokenSlug }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const assetRegistry = useSelector((root) => root.assetRegistry.assetRegistry);
  // @ts-ignore
  const priceMap = useSelector((state) => state.price.priceMap);
  const [feeEditorModalRenderKey, setFeeEditorModalRenderKey] = useState<string>(modalId);

  const tokenAsset = (() => {
    return assetRegistry[tokenPayFeeSlug] || undefined;
  })();

  const nativeAsset = (() => {
    return assetRegistry[nativeTokenSlug] || undefined;
  })();

  const decimals = _getAssetDecimals(tokenAsset);
  // @ts-ignore
  const priceId = _getAssetPriceId(tokenAsset);
  const priceValue = priceMap[priceId] || 0;
  const symbol = _getAssetSymbol(tokenAsset);
  const priceNativeId = _getAssetPriceId(nativeAsset);
  const priceNativeValue = priceMap[priceNativeId] || 0;
  const nativeTokenSymbol = _getAssetSymbol(nativeAsset);
  const nativeTokenDecimals = _getAssetDecimals(nativeAsset);

  const feeValue = useMemo(() => {
    return BN_ZERO;
  }, []);

  const feePriceValue = useMemo(() => {
    return BN_ZERO;
  }, []);

  const isDataReady = !isLoading && !!feeOptionsInfo;

  const convertedFeeValueToUSD = useMemo(() => {
    if (!isDataReady) {
      return 0;
    }

    return new BigN(estimateFee)
      .multipliedBy(priceNativeValue)
      .dividedBy(BN_TEN.pow(nativeTokenDecimals || 0))
      .toNumber();
  }, [estimateFee, isDataReady, nativeTokenDecimals, priceNativeValue]);

  const onClickEdit = useCallback(() => {
    if (chainValue && ASSET_HUB_CHAIN_SLUGS.includes(chainValue)) {
      activeModal(CHOOSE_FEE_TOKEN_MODAL);
    } else {
      setFeeEditorModalRenderKey(`${modalId}_${Date.now()}`);
      setTimeout(() => {
        activeModal(modalId);
      }, 100);
    }
  }, [activeModal, chainValue]);

  const onSelectTransactionFee = useCallback((fee: TransactionFee) => {
    onSelect?.(fee);
  }, [onSelect]);

  const customFieldNode = useMemo(() => {
    if (!renderFieldNode) {
      return null;
    }

    return renderFieldNode({
      isLoading: isLoading,
      feeInfo: {
        decimals,
        symbol,
        value: feeValue,
        convertedValue: feePriceValue
      },
      disableEdit: isLoading,
      onClickEdit
    });
  }, [decimals, feeValue, isLoading, onClickEdit, renderFieldNode, symbol, feePriceValue]);

  const isXcm = useMemo(() => {
    return chainValue && destChainValue && chainValue !== destChainValue;
  }, [chainValue, destChainValue]);

  const isEditButton = useMemo(() => {
    return !!(chainValue && (ASSET_HUB_CHAIN_SLUGS.includes(chainValue) || feeType === 'evm')) && !isXcm;
  }, [isXcm, chainValue, feeType]);

  const rateValue = useMemo(() => {
    const selectedToken = listTokensCanPayFee.find((item) => item.slug === tokenPayFeeSlug);

    return selectedToken?.rate || 1;
  }, [listTokensCanPayFee, tokenPayFeeSlug]);

  const convertedEstimatedFee = useMemo(() => {
    return new BigN(estimateFee).multipliedBy(rateValue);
  }, [estimateFee, rateValue]);

  const isNativeTokenValue = !!(!isEditButton && isXcm);

  return (
    <>
      {
        customFieldNode || (
          <div className={CN(className, '__estimate-fee-wrapper')}>
            <div className='__field-left-part'>
              <div className='__field-label'>
                {t('Estimated fee')}:
              </div>

              <div>
                {!isDataReady
                  ? (
                    <ActivityIndicator size={20} />
                  )
                  : (
                    <Number
                      className={'__fee-value'}
                      decimal={isNativeTokenValue ? nativeTokenDecimals : decimals}
                      suffix={isNativeTokenValue ? nativeTokenSymbol : symbol}
                      value={isNativeTokenValue ? estimateFee : convertedEstimatedFee}
                    />
                  )}
              </div>
            </div>
            {feeType !== 'ton' && (
              <div className='__field-right-part'>
                <div
                  className='__fee-editor-area'
                >
                  <Number
                    className={'__fee-price-value'}
                    decimal={0}
                    prefix={'~ $'}
                    value={convertedFeeValueToUSD}
                  />

                  <Button
                    className={'__fee-editor-button'}
                    disabled={!isDataReady}
                    icon={
                      <Icon
                        phosphorIcon={PencilSimpleLine}
                        size='sm'
                      />
                    }
                    onClick={isEditButton ? onClickEdit : undefined}
                    size='xs'
                    tooltip={isEditButton ? undefined : t('Coming soon!')}
                    type='ghost'
                  />
                </div>
              </div>
            )}
          </div>
        )
      }

      <FeeEditorModal
        chainValue={chainValue}
        currentTokenPayFee={currentTokenPayFee}
        decimals={decimals}
        feeOptionsInfo={feeOptionsInfo}
        feeType={feeType}
        key={feeEditorModalRenderKey}
        listTokensCanPayFee={listTokensCanPayFee}
        modalId={modalId}
        onSelectOption={onSelectTransactionFee}
        onSetTokenPayFee={onSetTokenPayFee}
        priceValue={priceValue}
        selectedFeeOption={selectedFeeOption}
        symbol={symbol}
        tokenSlug={tokenPayFeeSlug}
      />

      <ChooseFeeTokenModal
        convertedFeeValueToUSD={convertedFeeValueToUSD}
        estimateFee={estimateFee}
        feePercentageSpecialCase={feePercentageSpecialCase}
        items={listTokensCanPayFee}
        modalId={CHOOSE_FEE_TOKEN_MODAL}
        nativeTokenDecimals={nativeTokenDecimals}
        onSelectItem={onSetTokenPayFee}
        selectedItem={currentTokenPayFee || tokenPayFeeSlug}
        tokenSlug={tokenSlug}
      />
    </>
  );
};

const FeeEditor = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    gap: token.sizeXS,
    minHeight: 24,
    alignItems: 'center',

    '.ant-number': {
      '&, .ant-typography': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      }
    },

    '&.__estimate-fee-wrapper': {
      backgroundColor: token.colorBgSecondary,
      padding: token.paddingSM,
      paddingRight: token.paddingXS,
      height: token.sizeXXL,
      borderRadius: token.borderRadiusLG,
      '.__edit-icon': {
        color: token['gray-5']
      }
    },

    '.__field-left-part': {
      flex: 1,
      display: 'flex',
      gap: token.sizeXXS,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4
    },

    '.__field-right-part': {

    },

    '.__fee-editor-area': {
      display: 'flex',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight1,
      alignItems: 'center'
    },

    '.__fee-editor-button.__fee-editor-button.__fee-editor-button': {
      minWidth: 28,
      width: 28,
      height: 28
    }
  });
});

export default FeeEditor;
