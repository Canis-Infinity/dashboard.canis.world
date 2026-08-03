// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { getEventLogs } from '@/services/eventLogService';

export function useEventLogs({ page, type, keyword }) {
  const [state, setState] = useState({
    data: [],
    page: 1,
    total: 0,
    amount: 0,
    loading: true,
    error: '',
  });

  useEffect(() => {
    let active = true;

    setState((current) => ({ ...current, loading: true, error: '' }));
    getEventLogs({ page, type, keyword })
      .then((result) => {
        if (!active) return;
        setState({
          data: result.data || [],
          page: result.page || 1,
          total: result.total || 0,
          amount: result.amount || 0,
          loading: false,
          error: '',
        });
      })
      .catch((error) => {
        if (!active) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: error?.response?.data?.message || '無法取得事件紀錄',
        }));
      });

    return () => {
      active = false;
    };
  }, [page, type, keyword]);

  return state;
}
