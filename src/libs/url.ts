// @ts-nocheck
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7344';

export function apiAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${apiBaseUrl}/${path}`.replace(/([^:]\/)\/+/g, '$1');
}
