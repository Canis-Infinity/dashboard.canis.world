// @ts-nocheck
'use client';

import { ErrorEmptyState } from '@/components/shared/ErrorEmptyState';
import '@/styles/globals.css';

export default function GlobalError({ reset }) {
  return (
    <html lang="zh-Hant" className="dark" suppressHydrationWarning>
      <body>
        <ErrorEmptyState
          title="系統暫時無法回應"
          description="應用程式發生未預期錯誤，請稍後再試。"
          retry={reset}
        />
      </body>
    </html>
  );
}
