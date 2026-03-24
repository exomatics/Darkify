import { ApiClient, OpenAPI } from './gen';

let accessToken = '';

export const BACKEND_BASE = 'http://localhost:3000';

export function setToken(t: string) {
  accessToken = t;
  localStorage.setItem('access_token', t);
}

export function removeToken() {
  accessToken = '';
  localStorage.removeItem('access_token');
}

export function getStoredToken(): string | null {
  return localStorage.getItem('access_token');
}

OpenAPI.BASE = 'http://localhost:3000/api';
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.CREDENTIALS = 'include';
OpenAPI.TOKEN = async () => {
  if (!accessToken) {
    accessToken = getStoredToken() || '';
  }
  return accessToken;
};

export let api = new ApiClient();

export function initApiClient(token: string) {
  setToken(token);
  api = new ApiClient({
    BASE: 'http://localhost:3000/api',
    TOKEN: token,
    WITH_CREDENTIALS: true,
    CREDENTIALS: 'include',
    VERSION: '1.0.0',
  });
}
