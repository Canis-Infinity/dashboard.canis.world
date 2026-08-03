// @ts-nocheck
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

export function apiAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${apiBaseUrl}/${String(path).replace(/^\//, '')}`.replace(/([^:]\/)\/+/g, '$1');
}
