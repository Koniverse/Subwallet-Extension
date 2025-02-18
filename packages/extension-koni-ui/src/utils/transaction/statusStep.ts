// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StepStatus } from '@subwallet/extension-base/types';

export const isStepPending = (stepStatus?: StepStatus) => {
  return stepStatus === StepStatus.QUEUED;
};

export const isStepProcessing = (stepStatus?: StepStatus) => {
  return !!stepStatus && [StepStatus.PREPARE, StepStatus.SUBMITTING, StepStatus.PROCESSING].includes(stepStatus);
};

export const isStepCompleted = (stepStatus?: StepStatus) => {
  return stepStatus === StepStatus.COMPLETE;
};

export const isStepFailed = (stepStatus?: StepStatus) => {
  return !!stepStatus && [StepStatus.FAILED, StepStatus.CANCELLED, StepStatus.TIMEOUT].includes(stepStatus);
};
