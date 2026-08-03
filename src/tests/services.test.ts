// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/services/apiClient';
import { getDashboardCards } from '@/services/dashboardService';
import { getContacts } from '@/services/contactService';
import { getProfile, updateProfile } from '@/services/profileService';

describe('api services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps dashboard card payloads', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: { todayVisit: 1 } } });

    await expect(getDashboardCards()).resolves.toEqual({ todayVisit: 1 });
    expect(apiClient.get).toHaveBeenCalledWith('/api/dashboard/card');
  });

  it('requests contacts with pagination params', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: [], page: 1 } });

    await getContacts({ page: 2, type: 'pending' });
    expect(apiClient.get).toHaveBeenCalledWith('/api/contact/', {
      params: { page: 2, type: 'pending' },
    });
  });

  it('requests canis profile', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: { siteUrl: 'https://canis.world' } } });

    await expect(getProfile()).resolves.toEqual({ siteUrl: 'https://canis.world' });
    expect(apiClient.get).toHaveBeenCalledWith('/api/profile');
  });

  it('updates canis profile', async () => {
    const payload = { avatar: '/avatar.jpg', links: [] };
    apiClient.post.mockResolvedValueOnce({ data: { message: 'updated' } });
    apiClient.patch.mockResolvedValueOnce({ data: { message: 'updated' } });

    await updateProfile(payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/api/profile', payload);
  });
});
