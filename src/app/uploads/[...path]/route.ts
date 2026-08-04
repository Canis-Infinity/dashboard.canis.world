import { NextRequest } from 'next/server';

import { proxyBackend } from '@/lib/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyBackend(request, `/uploads/${path.join('/')}`);
}
