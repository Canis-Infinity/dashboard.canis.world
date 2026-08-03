// @ts-nocheck
export function apiAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `/${String(path).replace(/^\//, '')}`;
}
