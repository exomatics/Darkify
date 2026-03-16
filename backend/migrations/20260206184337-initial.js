'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_bitrate" AS ENUM ('low', 'normal', 'high', 'veryHigh', 'auto');
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_playlists_restrictions" AS ENUM ('private', 'public', 'unlisted');
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_playlists_type" AS ENUM ('general', 'liked', 'album');
    `);

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      is_artist: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      salt: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      visible_username: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(25),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
        unique: true,
      },
      avatar_url: {
        type: Sequelize.UUID,
        unique: true,
      },
      bitrate: {
        type: '"enum_users_bitrate"',
        defaultValue: 'high',
      },
    });

    await queryInterface.addIndex('users', ['username'], { name: 'idx_users_username' });
    await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' });

    await queryInterface.createTable('artists', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      description: {
        type: Sequelize.STRING(1690),
      },
      banner_id: {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('playlists', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tracks_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      description: {
        type: Sequelize.STRING(300),
      },
      cover_id: {
        type: Sequelize.UUID,
        unique: true,
      },
      likes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      owner: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      restrictions: {
        type: '"enum_playlists_restrictions"',
        allowNull: false,
      },
      type: {
        type: '"enum_playlists_type"',
        allowNull: false,
      },
    });
    await queryInterface.addIndex('playlists', ['owner'], { name: 'idx_playlists_owner' });
    await queryInterface.addIndex('playlists', ['type'], { name: 'idx_playlists_type' });
    await queryInterface.addIndex('playlists', ['name'], { name: 'idx_playlists_name' });

    await queryInterface.createTable('tracks', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      admin_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      lyrics: {
        type: Sequelize.TEXT,
      },
      play_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      album_id: {
        type: Sequelize.UUID,
        references: {
          model: 'playlists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cover_id: {
        type: Sequelize.UUID,
        unique: true,
      },
      creation_date: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_DATE'),
      },
    });
    await queryInterface.addIndex('tracks', ['admin_id'], { name: 'idx_tracks_admin_id' });
    await queryInterface.addIndex('tracks', ['album_id'], { name: 'idx_tracks_album_id' });
    await queryInterface.addIndex('tracks', ['name'], { name: 'idx_tracks_name' });
    await queryInterface.addIndex('tracks', ['deleted'], { name: 'idx_tracks_deleted' });
    await queryInterface.addIndex('tracks', ['play_count'], { name: 'idx_tracks_play_count' });

    await queryInterface.createTable('playlist_tracks', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      playlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'playlists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      track_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tracks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date_added: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('playlist_tracks', {
      fields: ['id', 'playlist_id', 'track_id', 'order'],
      type: 'primary key',
      name: 'playlist_tracks_pkey',
    });
    await queryInterface.addIndex('playlist_tracks', ['playlist_id'], {
      name: 'idx_playlist_tracks_playlist_id',
    });
    await queryInterface.addIndex('playlist_tracks', ['track_id'], {
      name: 'idx_playlist_tracks_track_id',
    });
    await queryInterface.addIndex('playlist_tracks', ['playlist_id', 'order'], {
      name: 'idx_playlist_tracks_playlist_order',
    });

    await queryInterface.createTable('track_artists', {
      artist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      track_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tracks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });

    await queryInterface.addConstraint('track_artists', {
      fields: ['artist_id', 'track_id'],
      type: 'primary key',
      name: 'track_artists_pkey',
    });

    await queryInterface.addIndex('track_artists', ['track_id'], {
      name: 'idx_track_artists_track_id',
    });

    await queryInterface.createTable('user_followers', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      follower_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('user_followers', {
      fields: ['user_id', 'follower_id'],
      type: 'primary key',
      name: 'user_followers_pkey',
    });

    await queryInterface.addIndex('user_followers', ['follower_id'], {
      name: 'idx_user_followers_follower_id',
    });

    await queryInterface.createTable('user_following', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      following_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('user_following', {
      fields: ['user_id', 'following_id'],
      type: 'primary key',
      name: 'user_following_pkey',
    });

    await queryInterface.addIndex('user_following', ['following_id'], {
      name: 'idx_user_following_following_id',
    });

    await queryInterface.createTable('playlist_followers', {
      playlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'playlists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('playlist_followers', {
      fields: ['playlist_id', 'user_id'],
      type: 'primary key',
      name: 'playlist_followers_pkey',
    });

    await queryInterface.addIndex('playlist_followers', ['user_id'], {
      name: 'idx_playlist_followers_user_id',
    });

    await queryInterface.createTable('library_playlists', {
      playlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'playlists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      date_added: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      date_played: {
        type: Sequelize.DATE,
      },
      order: {
        type: Sequelize.INTEGER,
      },
    });

    await queryInterface.addConstraint('library_playlists', {
      fields: ['playlist_id', 'user_id'],
      type: 'primary key',
      name: 'library_playlists_pkey',
    });

    await queryInterface.addIndex('library_playlists', ['user_id'], {
      name: 'idx_library_playlists_user_id',
    });
    await queryInterface.addIndex('library_playlists', ['user_id', 'order'], {
      name: 'idx_library_playlists_user_order',
    });

    await queryInterface.createTable('library_singles', {
      track_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tracks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      date_added: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      date_played: {
        type: Sequelize.DATE,
      },
      order: {
        type: Sequelize.INTEGER,
      },
    });

    await queryInterface.addConstraint('library_singles', {
      fields: ['track_id', 'user_id'],
      type: 'primary key',
      name: 'library_singles_pkey',
    });

    await queryInterface.addIndex('library_singles', ['user_id'], {
      name: 'idx_library_singles_user_id',
    });
    await queryInterface.addIndex('library_singles', ['user_id', 'order'], {
      name: 'idx_library_singles_user_order',
    });

    await queryInterface.createTable('playlist_albums', {
      playlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'playlists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      date_released: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('playlist_albums');
    await queryInterface.dropTable('library_singles');
    await queryInterface.dropTable('library_playlists');
    await queryInterface.dropTable('playlist_followers');
    await queryInterface.dropTable('user_following');
    await queryInterface.dropTable('user_followers');
    await queryInterface.dropTable('track_artists');
    await queryInterface.dropTable('playlist_tracks');
    await queryInterface.dropTable('tracks');
    await queryInterface.dropTable('playlists');
    await queryInterface.dropTable('artists');
    await queryInterface.dropTable('users');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_playlists_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_playlists_restrictions";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_bitrate";');
  },
};
