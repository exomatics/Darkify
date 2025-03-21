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
    GET_ME: `${API_BASE}/users/me`,
    PUT_ME: `${API_BASE}/users/me`,
    DELETE_ME: `${API_BASE}/users/me`,
    GET_ME_FOLLOWING: `${API_BASE}/users/following`,
    GET_USER: `${API_BASE}/users/:userId`, // IMPLEMENT
    POST_REGISTER: `${API_BASE}/users/register`,
    POST_LOGIN: `${API_BASE}/users/login`,
    POST_ISSUE_ACCESS_TOKEN: `${API_BASE}/users/refresh-token`,
    POST_FOLLOW_USER: `${API_BASE}/users/follow/user/:followUserId`,
    POST_UNFOLLOW_USER: `${API_BASE}/users/unfollow/user/:unfollowUserId`,
    POST_FOLLOW_PLAYLIST: `${API_BASE}/users/follow/playlist/:followPlaylistId`,
    POST_UNFOLLOW_PLAYLIST: `${API_BASE}/users/unfollow/playlist/:unfollowPlaylistId`,
  },
  PLAYLISTS: {
    GET: `${API_BASE}/playlist:playlistId`,
  },
} as const);
