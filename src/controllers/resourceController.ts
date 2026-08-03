// @ts-nocheck
import { getErrorMessage } from '@/utils/apiError';

export async function runMutation(action, { onSuccess, successMessage = '操作完成' } = {}) {
  try {
    const result = await action();
    await onSuccess?.(result);
    return {
      ok: true,
      message: result?.message || successMessage,
      data: result,
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error),
      data: null,
    };
  }
}
