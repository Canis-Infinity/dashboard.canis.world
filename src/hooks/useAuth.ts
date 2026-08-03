// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { hasBrowserToken } from '@/middlewares/clientGuards';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    setAuthenticated(hasBrowserToken());
  }, []);

  return authenticated;
}
