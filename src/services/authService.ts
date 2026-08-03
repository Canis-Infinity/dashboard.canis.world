// @ts-nocheck
import { apiClient } from './apiClient';

export async function login(formData) {
  const response = await apiClient.post('/api/user/login', formData);
  return response.data;
}

export async function logout() {
  const response = await apiClient.post('/api/user/logout');
  return response.data;
}
