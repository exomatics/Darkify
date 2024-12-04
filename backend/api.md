# Darkify

# API

## Error Codes

- `400 Bad Request`: Invalid request format or parameters.
- `401 Unauthorized`: Authentication failed.
- `404 Not Found`: Resource not found.
- `500 Internal Server Error`: Unexpected server error.

# Entities

## User

- **Id** (string)
- **Name** (string)
- **Email** (string)
- **Password** (string)
- **IsArtist** (boolean)
- **Followers** (User.id[])
- **Following** (User.id[])
- **Avatar** (string - URL to image)
- **Playlists** (Playlist.id[])

## Track

- **Id** (string)
- **Name** (string)
- **Artist** (User.id[])
- **Lyrics** (string)
- **NumberOfPlays** (number)
- **ObjectUrl** (string)

## Playlist

- **Id** (string)
- **Content** (Track.id[])
- **Name** (string)
- **Description** (string)
- **Cover** (string - URL to image)
- **Owner** (User.id)
- **Restriction** (User.id | null)
<!-- - **Users** (User.id[]) -->

# API Endpoints

## Tracks:

- **GET** `/api/tracks/{trackId}` -> Track
- **POST** `/api/tracks` -> Add track (params)

## User:

- **POST** `/api/users/register` -> Register new user
- **POST** `/api/users/login` -> User login
- **GET** `/api/users/{userId}` -> Name, Avatar, Followers.length, Following.length
- **PUT** `/api/users/{userId}` -> Update user details
- **GET** `/api/users/{userId}/library` -> User.Playlists

## Playlist:

- **GET** `/api/playlist/{playlistId}` -> Playlist
- **POST** `/api/playlist` -> Create playlist
- **PUT** `/api/playlist` -> Update playlist
- **DELETE** `/api/playlist/{playlistId}` -> Delete playlist
- **GET** `/api/playlist/{playlistId}/tracks` -> Track[]
- **POST** `/api/playlist/{playlistId}/tracks` -> Add track to playlist
- **DELETE** `/api/playlist/{playlistId}/tracks/{trackId}` -> Delete track from playlist

## Dashboard:

- **GET** `/api/search` (searchFilter: string, offset: number) -> { - tracks: TrackItem[] (Omit<Lyrics>) - playlist: PlaylistItem[]
  }
- **GET** `/api/dashboard` -> { - tracks: TrackItem[] (Omit<Lyrics>) - playlist: PlaylistItem[] - users: User[] (if artist)
  }
