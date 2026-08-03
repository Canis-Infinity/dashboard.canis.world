// @ts-nocheck
'use client';

import { ErrorEmptyState } from '@/components/shared/ErrorEmptyState';

export default function Error({ reset }) {
  return (
    <ErrorEmptyState
      title="系統暫時無法回應"
      description="伺服器暫時無法完成請求，請稍後再試。"
      retry={reset}
    />
  );
}
