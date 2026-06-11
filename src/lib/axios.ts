import axios from 'axios';
import { useAuth } from '@clerk/react';
import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://dummyjson.com';

// Original instance for dummyjson product operations
export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Custom instance for database and custom backend functions (Neon / Cloudflare)
export const dbAxiosInstance = axios.create({
  baseURL: '', // Relative requests will route to Cloudflare Page Functions
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// React Helper to synchronize Clerk session token to Axios requests dynamically
export function AxiosAuthSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Sync with database API instance
    const dbInterceptor = dbAxiosInstance.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      dbAxiosInstance.interceptors.request.eject(dbInterceptor);
    };
  }, [getToken]);

  return null;
}
