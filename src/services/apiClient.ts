// @ts-nocheck
import axios from 'axios';
import { getToken } from '@/utils/getToken';

export const apiClient = axios.create({
  baseURL: '',
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});
