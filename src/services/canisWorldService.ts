// @ts-nocheck
import { apiClient } from "./apiClient";

export async function getCanisWorldAdmin() {
  const response = await apiClient.get("/api/canis-world/admin");
  return response.data.data;
}

export async function updateCanisWorldSettings(payload) {
  const response = await apiClient.patch("/api/canis-world/settings", payload);
  return response.data;
}

export async function createCanisWorldEntry(payload) {
  const response = await apiClient.post("/api/canis-world/entries", payload);
  return response.data;
}

export async function updateCanisWorldEntry(id, payload) {
  const response = await apiClient.patch(
    `/api/canis-world/entries/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteCanisWorldEntry(id) {
  const response = await apiClient.delete(`/api/canis-world/entries/${id}`);
  return response.data;
}

function collectionUrl(collection, id) {
  return `/api/canis-world/${collection}${id ? `/${id}` : ""}`;
}

export async function createCanisWorldCollectionItem(collection, payload) {
  const response = await apiClient.post(collectionUrl(collection), payload);
  return response.data;
}

export async function updateCanisWorldCollectionItem(collection, id, payload) {
  const response = await apiClient.patch(
    collectionUrl(collection, id),
    payload,
  );
  return response.data;
}

export async function deleteCanisWorldCollectionItem(collection, id) {
  const response = await apiClient.delete(collectionUrl(collection, id));
  return response.data;
}

export async function uploadCanisWorldMedia(files, config = {}) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("media", file));
  const response = await apiClient.post(
    "/api/canis-world/media",
    formData,
    config,
  );
  return response.data;
}
