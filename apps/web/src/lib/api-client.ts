import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { ENV } from './constants';
import type { ApiResponse, GenerationConfig, Generation, PaginatedResponse } from '@forgeitup/shared';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${ENV.API_URL}/api/v1`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Attach JWT from NextAuth session
  client.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  });

  // Normalize error responses
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
      const message =
        error.response?.data?.error ?? error.message ?? 'An unexpected error occurred';
      return Promise.reject(new Error(message));
    },
  );

  return client;
};

const apiClient = createApiClient();

// ============================================================
// Generations API
// ============================================================

export const generationsApi = {
  create: async (config: GenerationConfig): Promise<ApiResponse<{ id: string }>> => {
    const { data } = await apiClient.post('/generations', config);
    return data;
  },

  list: async (
    page = 1,
    pageSize = 20,
  ): Promise<ApiResponse<PaginatedResponse<Generation>>> => {
    const { data } = await apiClient.get('/generations', { params: { page, pageSize } });
    return data;
  },

  get: async (id: string): Promise<ApiResponse<Generation>> => {
    const { data } = await apiClient.get(`/generations/${id}`);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/generations/${id}`);
    return data;
  },

  fork: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const { data } = await apiClient.post(`/generations/${id}/fork`);
    return data;
  },

  getDownloadUrl: async (id: string): Promise<ApiResponse<{ url: string; expiresAt: string }>> => {
    const { data } = await apiClient.get(`/generations/${id}/download`);
    return data;
  },
};

// ============================================================
// Minecraft API
// ============================================================

export const minecraftApi = {
  getVersions: async () => {
    const { data } = await apiClient.get('/minecraft/versions');
    return data;
  },

  getCompatibleLoaders: async (version: string, platform: string) => {
    const { data } = await apiClient.get(`/minecraft/versions/${version}/loaders`, {
      params: { platform },
    });
    return data;
  },

  detectLoader: async (mcVersion: string, platform: string) => {
    const { data } = await apiClient.post('/minecraft/detect-loader', { mcVersion, platform });
    return data;
  },
};

// ============================================================
// Billing API
// ============================================================

export const billingApi = {
  getPlans: async () => {
    const { data } = await apiClient.get('/billing/plans');
    return data;
  },

  subscribe: async (tier: string, interval: 'monthly' | 'annual') => {
    const { data } = await apiClient.post('/billing/subscribe', { tier, interval });
    return data;
  },

  getPortalUrl: async () => {
    const { data } = await apiClient.post('/billing/portal');
    return data;
  },

  getUsage: async () => {
    const { data } = await apiClient.get('/billing/usage');
    return data;
  },
};

export default apiClient;
