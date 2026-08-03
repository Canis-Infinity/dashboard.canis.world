// @ts-nocheck
export function getToken() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('token')) return null;
    return JSON.parse(localStorage.getItem('token')).token;
  }
  return null;
}