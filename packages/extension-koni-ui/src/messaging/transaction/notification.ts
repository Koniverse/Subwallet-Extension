// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _NotificationInfo } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { GetNotificationParams } from '@subwallet/extension-base/types/notification';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function markAllReadNotification (request: string) {
  return sendMessage('pri(inappNotification.markAllReadNotification)', request);
}

export async function changeReadNotificationStatus (request: _NotificationInfo) {
  return sendMessage('pri(inappNotification.changeReadNotificationStatus)', request);
}

export async function getInappNotifications (request: GetNotificationParams) {
  return sendMessage('pri(inappNotification.getInappNotifications)', request);
}
