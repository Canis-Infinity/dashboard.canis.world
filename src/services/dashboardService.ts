// @ts-nocheck
import { apiClient } from './apiClient';

export async function getDashboardCards() {
  const response = await apiClient.get('/api/dashboard/card');
  return response.data.data;
}

export async function getDashboardChart() {
  const response = await apiClient.get('/api/dashboard/chart');
  return response.data.data;
}
