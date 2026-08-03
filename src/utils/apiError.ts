// @ts-nocheck
export function getErrorMessage(error, fallback = '操作失敗，請稍後再試') {
  if (typeof error === 'string') return error;

  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;

  if (serverMessage) return serverMessage;

  if (status === 400) return '送出的資料格式不正確，請檢查後再試。';
  if (status === 401) return '帳號或密碼錯誤，請重新確認。';
  if (status === 403) return '你沒有權限執行這個操作。';
  if (status === 404) return '找不到指定的資料。';
  if (status === 409) return '資料狀態已變更，請重新整理後再試。';
  if (status === 422) return '欄位內容未通過驗證，請檢查後再送出。';
  if (status >= 500) return '伺服器暫時無法處理，請稍後再試。';

  if (error?.code === 'ERR_NETWORK') return '無法連線到伺服器，請檢查網路後再試。';
  if (error?.code === 'ECONNABORTED') return '連線逾時，請稍後再試。';

  return fallback;
}
