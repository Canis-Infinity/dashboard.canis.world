// @ts-nocheck
import { apiClient } from './apiClient';

export async function getProfile() {
  const response = await apiClient.get('/api/profile');
  return response.data.data;
}

export async function updateProfile(payload) {
  const response = await apiClient.patch('/api/profile', payload);
  return response.data;
}

export async function uploadProfileAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await apiClient.post('/api/profile/avatar', formData);
  return response.data;
}

export async function createProfileLink(payload) {
  const response = await apiClient.post('/api/profile/links', payload);
  return response.data;
}

export async function updateProfileLink(id, payload) {
  const response = await apiClient.patch(`/api/profile/links/${id}`, payload);
  return response.data;
}

export async function reorderProfileLinks(orderedIds) {
  const response = await apiClient.patch('/api/profile/links/reorder', { orderedIds });
  return response.data;
}

export async function deleteProfileLink(id) {
  const response = await apiClient.delete(`/api/profile/links/${id}`);
  return response.data;
}
