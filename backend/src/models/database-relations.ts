import type { Idb } from '../interfaces/database-interface.ts';

async function assignRelations(database: Idb) {
  await database.queryInterface.addConstraint('playlist_tracks', {
    fields: ['playlist_id'],
    type: 'foreign key',
    name: 'fk_playlist_tracks_playlist',
    references: {
      table: 'playlists',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  await database.queryInterface.addConstraint('playlist_tracks', {
    fields: ['track_id'],
    type: 'foreign key',
    name: 'fk_playlist_tracks_track',
    references: {
      table: 'tracks',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await database.queryInterface.addConstraint('track_artists', {
    fields: ['artist_id'],
    type: 'foreign key',
    name: 'fk_track_artists_user_id',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  await database.queryInterface.addConstraint('track_artists', {
    fields: ['track_id'],
    type: 'foreign key',
    name: 'fk_track_artists_track_id',
    references: {
      table: 'tracks',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await database.queryInterface.addConstraint('playlist_tracks', {
    fields: ['track_id'],
    type: 'foreign key',
    name: 'playlist_tracks_track_id_fk',
    references: {
      table: 'tracks',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  await database.queryInterface.addConstraint('playlist_tracks', {
    fields: ['playlist_id'],
    type: 'foreign key',
    name: 'playlist_tracks_playlist_id_fk',
    references: {
      table: 'playlists',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  await database.queryInterface.addConstraint('user_followings', {
    fields: ['following_id'],
    type: 'foreign key',
    name: 'user_followings_following_id_fk',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  await database.queryInterface.addConstraint('user_followings', {
    fields: ['user_id'],
    type: 'foreign key',
    name: 'user_followings_user_id_fk',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  await database.queryInterface.addConstraint('user_followers', {
    fields: ['follower_id'],
    type: 'foreign key',
    name: 'user_followers_follower_id_fk',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  await database.queryInterface.addConstraint('user_followers', {
    fields: ['user_id'],
    type: 'foreign key',
    name: 'user_followers_user_id_fk',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await database.queryInterface.addConstraint('playlists', {
    fields: ['owner'],
    type: 'foreign key',
    name: 'playlists_owner_fk',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await database.queryInterface.addConstraint('playlist_followers', {
    fields: ['user_id'],
    type: 'foreign key',
    name: 'playlist_followers_user_id_fk',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  await database.queryInterface.addConstraint('playlist_followers', {
    fields: ['playlist_id'],
    type: 'foreign key',
    name: 'playlist_followers_playlist_id_fk',
    references: {
      table: 'playlists',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  await database.queryInterface.addConstraint('playlist_albums', {
    fields: ['playlist_id'],
    type: 'foreign key',
    name: 'playlist_albums_playlist_id_fk',
    references: {
      table: 'playlists',
      field: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
  await database.queryInterface.addConstraint('artists', {
    fields: ['user_id'],
    type: 'foreign key',
    name: 'user_id_user_id_fk',
    references: {
      table: 'users',
      field: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
}

export { assignRelations };
