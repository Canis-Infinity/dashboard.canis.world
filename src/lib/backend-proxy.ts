import { NextRequest } from 'next/server';

const backendBaseUrl = () =>
  process.env.INTERNAL_API_BASE_URL
  || (process.env.NODE_ENV === 'development'
    ? 'http://localhost:7344'
    : 'http://host.docker.internal:7344');

export async function proxyBackend(request: NextRequest, pathname: string) {
  const target = new URL(pathname, backendBaseUrl());
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.set('x-forwarded-host', request.nextUrl.host);
  headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''));

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    });
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.set('cache-control', 'no-store, max-age=0');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Backend proxy request failed', { target: target.origin, error });
    return Response.json(
      { message: 'Backend service unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
