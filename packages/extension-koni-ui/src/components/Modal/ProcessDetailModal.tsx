// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ProcessTransactionData, ResponseSubscribeProcessById } from '@subwallet/extension-base/types';
import { PROCESS_DETAIL_MODAL } from '@subwallet/extension-koni-ui/constants';
import { cancelSubscription, subscribeProcess } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext, SwModal } from '@subwallet/react-ui';
import { SwIconProps } from '@subwallet/react-ui/es/icon';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  processId: string;
  onCancel: () => void;
};

export interface ActionInfo {
  title: string;
  extrinsicType: ExtrinsicType;
  backgroundColor: string;
  leftIcon?: SwIconProps['phosphorIcon'];
  disabled?: boolean;
  isRead?: boolean;
}

export interface BriefActionInfo {
  icon: ActionInfo['leftIcon'];
  title: ActionInfo['title'];
  backgroundColor?: ActionInfo['backgroundColor'];
}

const modalId = PROCESS_DETAIL_MODAL;

const Component: FC<Props> = (props: Props) => {
  const { className, onCancel, processId } = props;
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const [process, setProcess] = useState<ProcessTransactionData | undefined>();

  useEffect(() => {
    let cancel = false;
    let id = '';

    const onCancel = () => {
      if (id) {
        cancelSubscription(id).catch(console.error);
      }
    };

    if (!processId) {
      inactiveModal(modalId);
    } else {
      const updateProcess = (data: ResponseSubscribeProcessById) => {
        if (!cancel) {
          id = data.id;
          setProcess(data.process);

          console.debug('ProcessDetailModal', data);
        } else {
          onCancel();
        }
      };

      subscribeProcess({ processId }, updateProcess)
        .then(updateProcess)
        .catch(console.error);
    }

    return () => {
      cancel = true;
      onCancel();
    };
  }, [inactiveModal, processId]);

  if (!process) {
    return null;
  }

  return (
    <SwModal
      className={className}
      destroyOnClose={true}
      id={modalId}
      onCancel={onCancel}
      title={t('Actions')}
    >
      Process {processId}
    </SwModal>
  );
};

const ProcessDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({

  });
});

export default ProcessDetailModal;
