import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getStoredToken, setToken, initApiClient } from './api';

const refreshClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

let isRefreshing = false;
let queue: {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  config: AxiosRequestConfig;
}[] = [];

function processQueue(error: unknown, token?: string) {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else {
      if (token && p.config.headers) {
        p.config.headers['Authorization'] = `Bearer ${token}`;
      }
      p.resolve(axios(p.config));
    }
  });
  queue = [];
}

export function setupAxiosInterceptors() {
  axios.interceptors.request.use((cfg) => {
    const token = getStoredToken();
    if (token && cfg.headers) {
      cfg.headers['Authorization'] = `Bearer ${token}`;
    }
    cfg.withCredentials ??= false;

    if (cfg.url?.includes('/users/refresh-token')) {
      cfg.withCredentials = true;
    }

    if (token) cfg.headers!['Authorization'] = `Bearer ${token}`;
    return cfg;
  });

  axios.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config!;
      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      (original as any)._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, config: original });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await refreshClient.post('/users/refresh-token');
        const { token } = data as { token?: string };

        if (!token) throw new Error('No token in refresh response');

        setToken(token);
        initApiClient(token);
        processQueue(null, token);

        if (original.headers) original.headers['Authorization'] = `Bearer ${token}`;
        return axios(original);
      } catch (err) {
        processQueue(err);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
