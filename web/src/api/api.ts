import { ApiClient, OpenAPI } from './gen';

let accessToken = '';

export function setToken(t: string) {
  accessToken = t;
}

OpenAPI.BASE = 'http://localhost:3000/api';
OpenAPI.TOKEN = async () => accessToken;

export let api = new ApiClient();

export function initApiClient(token: string) {
  api = new ApiClient({ BASE: 'http://localhost:3000/api', TOKEN: token });
}
