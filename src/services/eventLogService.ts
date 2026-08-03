// @ts-nocheck
import { apiClient } from './apiClient';

export async function getEventLogs(params = {}) {
  const res = await apiClient.get('/api/event-logs', { params });
  return res.data;
}
