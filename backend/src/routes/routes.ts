const API_BASE = '/api';
export const ROUTES = Object.freeze({
  TRACKS: {
    GET: `${API_BASE}/tracks/:trackId`,
    CREATE: `${API_BASE}/tracks`,
    UPDATE: `${API_BASE}/tracks/:trackId`,
  },
  USERS: {
    GET: `${API_BASE}/users/:userId`,
    CREATE: `${API_BASE}/users`,
  },
} as const);
