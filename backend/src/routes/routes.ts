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
    GET_TRACK_INFO: `${API_BASE}/tracks/`,
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
    PUT_EVENTS_PLAYED: `${API_BASE}/users/me/events/played`,
    DELETE_ME: `${API_BASE}/users/me`,
    GET_ME_SETTINGS: `${API_BASE}/users/me/settings`,
    GET_ME_AVATAR: `${API_BASE}/users/me/avatar`,
    PUT_ME_BANNER: `${API_BASE}/users/me/banner`,
    GET_ME_FOLLOWING: `${API_BASE}/users/me/following`,
    GET_USER: `${API_BASE}/users/:user_id`,
    POST_REGISTER: `${API_BASE}/users/register`,
    POST_LOGIN: `${API_BASE}/users/login`,
    POST_ISSUE_ACCESS_TOKEN: `${API_BASE}/users/refresh-token`,
    POST_TURN_TO_ARTIST: `${API_BASE}/users/me/turn-to-artist`,
    POST_FOLLOW_USER: `${API_BASE}/users/follow/user/:user_id`,
    POST_UNFOLLOW_USER: `${API_BASE}/users/unfollow/user/:user_id`,
    POST_FOLLOW_PLAYLIST: `${API_BASE}/users/follow/playlist/:playlist_id`,
    POST_UNFOLLOW_PLAYLIST: `${API_BASE}/users/unfollow/playlist/:playlist_id`,
    POST_FOLLOW_ALBUM: `${API_BASE}/users/follow/album/:album_id`,
    POST_UNFOLLOW_ALBUM: `${API_BASE}/users/unfollow/album/:album_id`,
    POST_FOLLOW_SINGLE: `${API_BASE}/users/follow/single/:single_id`,
    POST_UNFOLLOW_SINGLE: `${API_BASE}/users/unfollow/single/:single_id`,
    PUT_ME_AVATAR: `${API_BASE}/users/me/avatar`,
  },
  PLAYLISTS: {
    GET_PLAYLIST: `${API_BASE}/playlists/:playlistId`,
    GET_PLAYLIST_COVER: `${API_BASE}/playlists/:playlistId/cover`,
    GET_PLAYLIST_TRACKS: `${API_BASE}/playlists/:playlistId/tracks`,
    GET_SEARCH_PLAYLIST_TRACKS: `${API_BASE}/search/playlists/:playlistId/tracks`,
    GET_PLAYLISTS: `${API_BASE}/playlists/`,
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
    GET_ME_ARTISTS: `${API_BASE}/me/library/artists`,
    GET_ME_PLAYLISTS: `${API_BASE}/me/library/playlists`,
    GET_ME_RELEASES: `${API_BASE}/me/library/releases`,
    PUT_ME_RELEASES_REORDER: `${API_BASE}/me/library/releases/:releaseId/reorder`,
    PUT_ME_PLAYLISTS_REORDER: `${API_BASE}/me/library/playlists/:playlistId/reorder`,
  },
  ALBUMS: {
    GET_ALBUM: `${API_BASE}/albums/:albumId`,
    GET_ALBUM_COVER: `${API_BASE}/albums/:albumId/cover`,
    GET_ME_ALBUMS: `${API_BASE}/me/albums`,
    GET_ALBUM_TRACKS: `${API_BASE}/albums/:albumId/tracks`,
    POST_ALBUM: `${API_BASE}/albums`,
    POST_ADD_TRACK: `${API_BASE}/albums/add-track/:trackId`,
    POST_REMOVE_TRACK: `${API_BASE}/albums/remove-track/:albumTrackId`,
    PUT_ALBUM_INFO: `${API_BASE}/albums/:albumId`,
    PUT_ALBUM_COVER: `${API_BASE}/albums/:albumId/cover`,
    PUT_ALBUM_REORDER: `${API_BASE}/albums/:albumId/reorder`,
    DELETE_ALBUM: `${API_BASE}/albums/:albumId`,
  },
  ARTISTS: {
    GET_ARTIST: `${API_BASE}/artists/:artistId`,
    GET_ARTIST_LIKED: `${API_BASE}/artists/:artistId/liked`,
    GET_ALBUMS: `${API_BASE}/artists/:artistId/albums`,
    GET_SINGLES: `${API_BASE}/artists/:artistId/singles`,
    GET_POPULAR: `${API_BASE}/artists/:artistId/popular`,
    GET_TOP_TRACKS: `${API_BASE}/artists/:artistId/top-tracks`,
    GET_DISCOGRAPHY: `${API_BASE}/artists/:artistId/discography`,
  },
  DASHBOARD: {
    GET_DASHBOARD: `${API_BASE}/dashboard`,
  },
  GLOBAL_SEARCH: {
    GET_ALL: `${API_BASE}/search/global`,
    GET_TRACKS: `${API_BASE}/search/tracks`,
    GET_ARTISTS: `${API_BASE}/search/artists`,
    GET_PLAYLISTS: `${API_BASE}/search/playlists`,
    GET_ALBUMS: `${API_BASE}/search/albums`,
    GET_USERS: `${API_BASE}/search/users`,
  },
} as const);
