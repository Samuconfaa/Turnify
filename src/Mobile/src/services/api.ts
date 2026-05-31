import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const BASE_URL = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:5000';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('turniup_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync('turniup_refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
      const newToken: string = data.accessToken;

      await SecureStore.setItemAsync('turniup_access_token', newToken);
      if (data.refreshToken) {
        await SecureStore.setItemAsync('turniup_refresh_token', data.refreshToken);
      }

      refreshQueue.forEach(cb => cb(newToken));
      refreshQueue = [];

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      refreshQueue = [];
      await Promise.all([
        SecureStore.deleteItemAsync('turniup_access_token'),
        SecureStore.deleteItemAsync('turniup_refresh_token'),
        SecureStore.deleteItemAsync('turniup_user'),
      ]);
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export function apiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as { message?: string })?.message ?? e.message;
  }
  return 'Errore sconosciuto';
}
