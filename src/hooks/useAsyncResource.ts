// @ts-nocheck
'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/utils/apiError';

export function useAsyncResource(fetcher, dependencies = [], options = {}) {
  const { enabled = true, initialData = null, fallbackError = '無法取得資料' } = options;
  const [state, setState] = useState({
    data: initialData,
    loading: enabled,
    refreshing: false,
    error: '',
  });

  const refetch = useCallback(async () => {
    if (!enabled) return null;
    setState((current) => ({
      ...current,
      loading: current.data == null,
      refreshing: current.data != null,
      error: '',
    }));

    try {
      const data = await fetcher();
      setState({ data, loading: false, refreshing: false, error: '' });
      return data;
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: getErrorMessage(error, fallbackError),
      }));
      return null;
    }
  }, [enabled, fetcher, fallbackError]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!enabled) return;
      setState((current) => ({
        ...current,
        loading: current.data == null,
        refreshing: current.data != null,
        error: '',
      }));

      try {
        const data = await fetcher();
        if (active) {
          setState({ data, loading: false, refreshing: false, error: '' });
        }
      } catch (error) {
        if (active) {
          setState((current) => ({
            ...current,
            loading: false,
            refreshing: false,
            error: getErrorMessage(error, fallbackError),
          }));
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [enabled, fetcher, fallbackError, ...dependencies]);

  return { ...state, refetch };
}
