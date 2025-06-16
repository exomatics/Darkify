import { ApiClient, OpenAPI } from './gen';

let accessToken = '';

export const BACKEND_BASE = 'http://localhost:3000';

export function setToken(t: string) {
  accessToken = t;
  localStorage.setItem('access_token', t);
}

export function removeToken() {
  localStorage.removeItem('access_token');
}

export function getStoredToken(): string | null {
  return localStorage.getItem('access_token');
}

OpenAPI.BASE = 'http://localhost:3000/api';
OpenAPI.TOKEN = async () => {
  if (!accessToken) {
    accessToken = getStoredToken() || '';
  }
  return accessToken;
};
OpenAPI.CREDENTIALS = 'same-origin';

export let api = new ApiClient();

export function initApiClient(token: string) {
  setToken(token);
  api = new ApiClient({ BASE: 'http://localhost:3000/api', TOKEN: token });
}

api.auth.postUsersRefreshToken();
