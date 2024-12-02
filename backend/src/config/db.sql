Create DATABASE darkify;
\c darkify
Create Table users(
    id uuid PRIMARY KEY NOT NULL,
    is_artist boolean NOT NULL,
    name varchar(25) NOT NULL,
	email varchar(254) NOT NULL Unique,
    avatar_id uuid NOT NULL Unique,
    followers_id uuid Unique,
	following uuid Unique,
	playlists uuid Unique
);
Create Table playlists(
    id uuid PRIMARY KEY  NOT NULL,
    tracks uuid Unique,
    name varchar(100) NOT NULL,
    description varchar(300),
    cover_url text NOT NULL,
    owner uuid Unique,
    restrictions uuid Unique
);

Create Table users_followers(
    id uuid PRIMARY KEY  NOT NULL,
    followers_id uuid Unique
);

Create Table users_following(
    id uuid PRIMARY KEY  NOT NULL,
    following_id uuid Unique    
);

Create Table tracks(
    id uuid PRIMARY KEY  NOT NULL,
    name varchar(100) NOT NULL,
	artist uuid,
	lyrics TEXT,
	numberOfPlay bigint NOT NULL
);

Create Table playlists_tracks(
    playlist_id uuid Unique NOT NULL,
    track_id uuid Unique NOT NULL,
    PRIMARY KEY (playlist_id, track_id)
);


alter table users add FOREIGN KEY(followers_id) References users_followers(followers_id), add FOREIGN KEY(following) References users_following(following_id), add FOREIGN KEY(playlists) References playlists(id);
alter table playlists add FOREIGN KEY(tracks) References playlist_tracks(track_id), add FOREIGN KEY(owner) References users(id), add FOREIGN KEY(restrictions) References users(id);
alter table users_followers add FOREIGN KEY(id) References users(id);
alter table users_following add FOREIGN KEY(id) References users(id);
alter table tracks add FOREIGN KEY(artist) References users(id);
alter table playlist_tracks add FOREIGN KEY(playlist_id) References playlists(id), add FOREIGN KEY(track_id) References tracks(id);




-- CREATE DATABASE darkify;
-- \c darkify;

-- CREATE TABLE users (
--     id UUID PRIMARY KEY NOT NULL,
--     is_artist BOOLEAN NOT NULL,
--     name VARCHAR(25) NOT NULL,
--     email VARCHAR(254) NOT NULL UNIQUE,
--     avatar_id UUID NOT NULL,
--     followers UUID UNIQUE,
--     following UUID UNIQUE,
--     playlists UUID UNIQUE
-- );

-- CREATE TABLE playlists (
--     id UUID PRIMARY KEY NOT NULL,
--     name VARCHAR(100) NOT NULL,
--     description VARCHAR(300) NOT NULL,
--     cover_url TEXT NOT NULL,
--     owner UUID NOT NULL,
--     restrictions UUID,
--     UNIQUE (id)
-- );

-- CREATE TABLE users_followers (
--     id UUID NOT NULL,
--     follower_id UUID NOT NULL,
--     PRIMARY KEY (id, follower_id),
--     FOREIGN KEY (id) REFERENCES users(id),
--     FOREIGN KEY (follower_id) REFERENCES users(id)
-- );

-- CREATE TABLE users_following (
--     id UUID NOT NULL,
--     following_id UUID NOT NULL,
--     PRIMARY KEY (id, following_id),
--     FOREIGN KEY (id) REFERENCES users(id),
--     FOREIGN KEY (following_id) REFERENCES users(id)
-- );

-- CREATE TABLE tracks (
--     id UUID PRIMARY KEY NOT NULL,
--     name VARCHAR(100) NOT NULL,
--     artist UUID,
--     lyrics TEXT,
--     number_of_plays BIGINT NOT NULL,
--     FOREIGN KEY (artist) REFERENCES users(id)
-- );

-- CREATE TABLE playlist_tracks (
--     playlist_id UUID,
--     track_id UUID,
--     PRIMARY KEY (playlist_id, track_id),
--     FOREIGN KEY (playlist_id) REFERENCES playlists(id),
--     FOREIGN KEY (track_id) REFERENCES tracks(id)
-- );

-- ALTER TABLE users 
--     ADD FOREIGN KEY (playlists) REFERENCES playlists(id),
--     add FOREIGN KEY(followers) References users_followers(followers_id),
--     add FOREIGN KEY(following) References users_following(following_id)

-- ALTER TABLE playlists 
--     ADD FOREIGN KEY (owner) REFERENCES users(id),
    
--     ADD FOREIGN KEY (restrictions) REFERENCES users(id);

-- alter table users add FOREIGN KEY(followers) References users_followers(followers_id), add FOREIGN KEY(following) References users_following(following_id), add FOREIGN KEY(playlists) References playlists(id);
-- alter table playlists add FOREIGN KEY(tracks) References playlist_tracks(track_id), add FOREIGN KEY(owner) References users(id), add FOREIGN KEY(restrictions) References users(id);
-- alter table users_followers add FOREIGN KEY(id) References users(id);
-- alter table users_following add FOREIGN KEY(id) References users(id);
-- alter table tracks add FOREIGN KEY(artist) References users(id);
-- alter table playlist_tracks add FOREIGN KEY(playlist_id) References playlists(id), add FOREIGN KEY(track_id) References tracks(id);