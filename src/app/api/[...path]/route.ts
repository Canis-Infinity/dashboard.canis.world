import { NextRequest } from 'next/server';

import { proxyBackend } from '@/lib/backend-proxy';

type Context = { params: Promise<{ path: string[] }> };

const handler = async (request: NextRequest, { params }: Context) => {
  const { path } = await params;
  return proxyBackend(request, `/api/${path.join('/')}`);
};

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT };
