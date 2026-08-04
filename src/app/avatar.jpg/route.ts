import { NextRequest } from 'next/server';

import { proxyBackend } from '@/lib/backend-proxy';

export const GET = (request: NextRequest) => proxyBackend(request, '/avatar.jpg');
