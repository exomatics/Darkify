# Darkify API

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

# Tech Stacks

## Backend:

- **Node.js**
- **Express.js**
- **Passport**
- **PostgreSQL**
- **Multer** - File upload (audio files)
- **fluent-ffmpeg** - HLS stream creation from audio files

## Frontend:

- **React**
- **React Router**
- **MobX**
- **Material UI**
- **HLS.js**

# SQL

## Tables

### Users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_artist BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(255),
    CONSTRAINT fk_user_followers FOREIGN KEY (id) REFERENCES user_followers(follower_id),
    CONSTRAINT fk_user_following FOREIGN KEY (id) REFERENCES user_following(following_id)
);
```

### User Followers

```sql
CREATE TABLE user_followers (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
);
```

### Tracks

```sql
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    artist INTEGER[],
    lyrics TEXT,
    number_of_plays INTEGER DEFAULT 0,
    object_url VARCHAR(255)
);
```

### Playlists

```sql
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover VARCHAR(255),
    owner INTEGER NOT NULL,
    restriction INTEGER,
    FOREIGN KEY (owner) REFERENCES users(id),
    FOREIGN KEY (restriction) REFERENCES users(id)
);
```

### Playlists Tracks

```sql
CREATE TABLE playlist_tracks (
    playlist_id INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, track_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);
```

### Playlist Users

```sql
CREATE TABLE playlist_users (
    playlist_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, user_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Liked Songs

```sql
CREATE TABLE user_liked_songs (
    user_id INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, track_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);
```

## Queries

- Get track

```sql
SELECT * FROM tracks WHERE id = $1;
```

- Add track

```sql
INSERT INTO tracks (name, artist, lyrics, number_of_plays, object_url)
VALUES ($1, $2, $3, $4, $5) RETURNING id;
```

- Get user

```sql
SELECT name, avatar, (SELECT COUNT(*) FROM user_followers WHERE following_id = $1) AS followers_count,
       (SELECT COUNT(*) FROM user_following WHERE follower_id = $1) AS following_count
FROM users WHERE id = $1;
```

- Get user library

```sql
SELECT playlist_id FROM playlist_users WHERE user_id = $1;
```

- Get playlist

```sql
SELECT * FROM playlists WHERE id = $1;
```

- Add track to the playlist

```sql
INSERT INTO playlist_tracks (playlist_id, track_id)
VALUES ($1, $2);
```

- Delete track from the playlist

```sql
DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2;
```
