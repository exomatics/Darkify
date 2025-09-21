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
    GET_TRACK_INFO: `${API_BASE}/tracks/:trackId`,
    GET_TRACKS: `${API_BASE}/tracks/search/:trackName`,
    PUT_TRACK: `${API_BASE}/tracks/:trackId`,
    POST_TRACK: `${API_BASE}/tracks/`,
    DELETE_TRACK: `${API_BASE}/tracks/:trackId`,
    GET_STREAM_TRACK: `${API_BASE}/tracks/stream/:trackId`,
  },
  USERS: {
    GET_ME: `${API_BASE}/users/me`,
    PUT_ME: `${API_BASE}/users/me`,
    PUT_ME_SETTINGS: `${API_BASE}/users/me/settings`,
    DELETE_ME: `${API_BASE}/users/me`,
    GET_ME_SETTINGS: `${API_BASE}/users/me/settings`,
    GET_ME_AVATAR: `${API_BASE}/users/me/avatar`,
    GET_ME_FOLLOWING: `${API_BASE}/users/me/following`,
    GET_USER: `${API_BASE}/users/:user_id`,
    POST_REGISTER: `${API_BASE}/users/register`,
    POST_LOGIN: `${API_BASE}/users/login`,
    POST_ISSUE_ACCESS_TOKEN: `${API_BASE}/users/refresh-token`,
    POST_FOLLOW_USER: `${API_BASE}/users/follow/user/:user_id`,
    POST_UNFOLLOW_USER: `${API_BASE}/users/unfollow/user/:user_id`,
    POST_FOLLOW_PLAYLIST: `${API_BASE}/users/follow/playlist/:playlist_id`,
    POST_UNFOLLOW_PLAYLIST: `${API_BASE}/users/unfollow/playlist/:playlist_id`,
    PUT_ME_AVATAR: `${API_BASE}/users/me/avatar`,
  },
  PLAYLISTS: {
    GET_PLAYLIST_INFO: `${API_BASE}/playlist/:playlistId`,
    GET_PLAYLIST_COVER: `${API_BASE}/playlist/cover/:playlistId`,
    GET_PLAYLIST_TRACKS: `${API_BASE}/playlist/tracks/:playlistId`,
    GET_PLAYLISTS: `${API_BASE}/playlist:playlistName`,
    GET_ME_LIBRARY: `${API_BASE}/me/library`, // should be in user
    GET_LIKED_SONGS_INFO: `${API_BASE}/collection`,
    GET_LIKED_SONGS_TRACKS: `${API_BASE}/collection/tracks`,
    POST_PLAYLIST: `${API_BASE}/playlist`,
    POST_ADD_TRACK: `${API_BASE}/playlist/add-track/:playlistId`,
    POST_REMOVE_TRACK: `${API_BASE}/playlist/remove-track/:playlistId`,
    PUT_PLAYLIST_INFO: `${API_BASE}/playlist/:playlistId`,
    PUT_PLAYLIST_RESTRICTIONS: `${API_BASE}/playlist-restrictions/:playlistId`,
    PUT_PLAYLIST_COVER: `${API_BASE}/playlist/cover/:playlistId`,
    PUT_PLAYLIST_REORDER: `${API_BASE}/playlist/reorder/:playlistId`,
  },
} as const);
