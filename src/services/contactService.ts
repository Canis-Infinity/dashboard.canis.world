// @ts-nocheck
import { apiClient } from './apiClient';

export async function getContacts(params = {}) {
  const response = await apiClient.get('/api/contact/', { params });
  return response.data;
}

export async function getContact(id) {
  const response = await apiClient.get(`/api/contact/${id}`);
  return response.data?.[0];
}

export async function updateContact(id, payload) {
  const response = await apiClient.patch(`/api/contact/${id}`, payload);
  return response.data;
}

export async function deleteContact(id) {
  const response = await apiClient.delete(`/api/contact/${id}`);
  return response.data;
}
