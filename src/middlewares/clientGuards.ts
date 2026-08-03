// @ts-nocheck
export function hasBrowserToken() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('token'));
}

export function requireBrowserToken() {
  if (!hasBrowserToken()) {
    throw new Error('尚未登入');
  }
}
