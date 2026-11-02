// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxyBackend } from '@/lib/backend-proxy';

afterEach(() => vi.unstubAllGlobals());

describe('backend proxy cache policy', () => {
  it.each([
    ['/uploads/canis-world/daily-123-456.jpg', 'image/jpeg', 200, 'public, max-age=3600'],
    ['/api/canis-world/admin/entries', 'application/json', 200, 'no-store, max-age=0'],
    ['/uploads/missing.jpg', 'text/html', 404, 'no-store, max-age=0'],
    ['/uploads/error.jpg', 'application/json', 200, 'no-store, max-age=0'],
  ])('sets safe caching for %s (%s, %s)', async (path, type, status, expected) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('body', {
      status,
      headers: { 'content-type': type, 'cache-control': 'public, max-age=3600' },
    })));
    const result = await proxyBackend(new NextRequest(`https://dashboard.canis.world${path}`), path);
    expect(result.headers.get('cache-control')).toBe(expected);
    expect(await result.text()).toBe('body');
  });
});
