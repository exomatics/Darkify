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
    PUT_EVENTS_PLAYED: `${API_BASE}/me/events/played`,
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
    GET_PLAYLIST: `${API_BASE}/playlists/:playlistId`,
    GET_PLAYLIST_COVER: `${API_BASE}/playlists/:playlistId/cover`,
    GET_PLAYLIST_TRACKS: `${API_BASE}/playlists/:playlistId/tracks`,
    GET_SEARCH_PLAYLIST_TRACKS: `${API_BASE}/search/playlists/:playlistId/tracks`,
    GET_PLAYLISTS: `${API_BASE}/playlists/`,
    // GET_LIKED_SONGS_INFO: `${API_BASE}/collection`,
    // GET_LIKED_SONGS_TRACKS: `${API_BASE}/collection/tracks`,
    POST_PLAYLIST: `${API_BASE}/playlists`,
    POST_ADD_TRACK: `${API_BASE}/playlists/add-track/`,
    POST_REMOVE_TRACK: `${API_BASE}/playlists/remove-track/`,
    PUT_PLAYLIST_INFO: `${API_BASE}/playlists/:playlistId`,
    PUT_PLAYLIST_RESTRICTIONS: `${API_BASE}/playlists/:playlistId/restrictions`,
    PUT_PLAYLIST_COVER: `${API_BASE}/playlists/:playlistId/cover`,
    PUT_PLAYLIST_REORDER: `${API_BASE}/playlists/:playlistId/reorder/`,
    DELETE_PLAYLIST: `${API_BASE}/playlists/:playlistId`,
  },
  LIKED: {
    GET_LIKED: `${API_BASE}/liked`,
    POST_ADD_TRACK: `${API_BASE}/liked/add-track/:trackId`,
    POST_REMOVE_TRACK: `${API_BASE}/liked/remove-track/:playlistTrackId`,
    PUT_LIKED_REORDER: `${API_BASE}/liked/reorder`,
    GET_LIKED_TRACKS: `${API_BASE}/liked/tracks`,
  },
  LIBRARY: {
    GET_ME_LIBRARY: `${API_BASE}/me/library`,
    GET_ME_PLAYLISTS: `${API_BASE}/me/library/playlists`,
    PUT_PLAYLISTS_REORDER: `${API_BASE}/me/library/playlists/:playlistId/reorder`,
  },
} as const);
