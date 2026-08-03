// @ts-nocheck
import { ErrorEmptyState } from '@/components/shared/ErrorEmptyState';

export default function NotFound() {
  return (
    <ErrorEmptyState
      title="找不到頁面"
      description="這個頁面可能已移除、網址輸入錯誤，或你目前沒有可瀏覽的路徑。"
    />
  );
}
