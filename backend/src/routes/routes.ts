const API_BASE = '/api';

/*## Playlist:

- **GET** `/api/playlist/{playlistId}` -> Playlist
- **POST** `/api/playlist` -> Create playlist
- **PUT** `/api/playlist` -> Update playlist
- **DELETE** `/api/playlist/{playlistId}` -> Delete playlist
- **GET** `/api/playlist/{playlistId}/tracks` -> Track[]
- **POST** `/api/playlist/{playlistId}/tracks` -> Add track to playlist
- **DELETE** `/api/playlist/{playlistId}/tracks/{trackId}` -> Delete track from playlist -->
 */

export const ROUTES = Object.freeze({
  TRACKS: {
    GET: `${API_BASE}/tracks/:trackId`,
    CREATE: `${API_BASE}/tracks`,
    UPDATE: `${API_BASE}/tracks/:trackId`,
  },
  USERS: {
    GET: `${API_BASE}/users/:userId`,
    POST_REGISTER: `${API_BASE}/users/register`,
    POST_LOGIN: `${API_BASE}/users/login`,
    POST_ISSUE_ACCESS_TOKEN: `${API_BASE}/users/refresh-token`,
  },
  PLAYLISTS: {
    GET: `${API_BASE}/playlist:playlistId`,
  },
} as const);
