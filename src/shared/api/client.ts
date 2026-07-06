import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

import { getRefreshToken } from './tokenStorage';
import { useAuthStore } from '../store/authStore';
import { emitAuthLogout } from './authEvents';

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type RefreshResponse = {
  accessToken: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const client = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10_000,
});

let refreshPromise: Promise<string> | null = null;

function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string) {
  config.headers = AxiosHeaders.from(config.headers);
  config.headers.set('Authorization', `Bearer ${token}`);
}

async function runRefresh() {
  const refreshToken = await getRefreshToken();

  try {
    const response = await client.post<RefreshResponse>('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    const currentUser = useAuthStore.getState().user;

    useAuthStore.getState().setAccessToken(accessToken);
    useAuthStore.setState({ isAuthenticated: Boolean(currentUser) });

    return accessToken;
  } catch (error) {
    useAuthStore.getState().clearSession();
    emitAuthLogout();
    throw error;
  }
}

function containsUnverifiedEmailSignal(value: unknown): boolean {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().replace(/[_-]+/g, ' ');
    if (/already\s+verified|previously\s+verified/.test(normalized)) return false;

    return (
      /\bemail\b/.test(normalized) &&
      (/\bunverified\b/.test(normalized) ||
        /\bnot\s+verified\b/.test(normalized) ||
        /\bverification\s+required\b/.test(normalized) ||
        /\bverify\s+(your\s+)?email\b/.test(normalized) ||
        /\bemail\s+must\s+be\s+verified\b/.test(normalized))
    );
  }

  if (Array.isArray(value)) {
    return value.some(containsUnverifiedEmailSignal);
  }

  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(containsUnverifiedEmailSignal);
  }

  return false;
}

client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    setAuthorizationHeader(config, accessToken);
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 403 && containsUnverifiedEmailSignal(error.response.data)) {
      useAuthStore.getState().setEmailVerification({ verified: false, verifiedAt: null });
    }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || originalRequest.url === '/auth/refresh') {
      throw error;
    }

    originalRequest._retry = true;

    refreshPromise ??= runRefresh().finally(() => {
      refreshPromise = null;
    });

    const token = await refreshPromise;
    setAuthorizationHeader(originalRequest, token);

    return client(originalRequest);
  },
);

export function resetRefreshStateForTests() {
  refreshPromise = null;
}
