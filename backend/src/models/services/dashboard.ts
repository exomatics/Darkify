import { QueryTypes } from 'sequelize';

import { STATIC_IMAGES_PATH } from '../../config/config.ts';
import database from '../../config/database.ts';
import { Restrictions, Type } from '../../interfaces/playlist-interface.ts';

import type { PlaylistAlbumInstanceWithRelations } from '../../interfaces/album-interface.ts';
import type {
  RandomAlbum,
  RandomArtist,
  RandomPlaylist,
  RecentlyPlayed,
  RecentRelease,
} from '../../interfaces/dashboard-interface.ts';
import type { SuccessfulResult } from '../../types/result-type.ts';
import type { PlaylistModel } from '../playlist.ts';
import type { UserModel } from '../user.ts';

type PlaylistInstanceWithUser = PlaylistModel & {
  user: UserModel;
};

class DashboardManager {
  async getRecentReleases(): Promise<SuccessfulResult<RecentRelease[]>> {
    // eslint-disable-next-line sonarjs/sql-queries
    const recentReleases = (await database.sequelize.query(
      `
            SELECT *
            FROM (
              SELECT 
                tracks.id,
                tracks.name,
                'single' AS type,
                (library_releases.id IS NOT NULL) AS is_followed,
                creation_date AS date_released,
                CASE 
                    WHEN tracks.cover_id IS NOT NULL 
                    THEN CONCAT(${database.sequelize.escape(STATIC_IMAGES_PATH)}, '/', tracks.cover_id, '.jpg')
                    ELSE NULL
                END AS cover_url
              FROM "tracks"
              LEFT JOIN library_releases on tracks.id = library_releases.track_id 

              UNION ALL
          
              SELECT 
                playlists.id,
                playlists.name,
                'album' AS type,
                (library_releases.id IS NOT NULL) AS is_followed,
                playlist_albums.date_released AS date_released,
                CASE 
                    WHEN playlists.cover_id IS NOT NULL 
                    THEN CONCAT(${database.sequelize.escape(STATIC_IMAGES_PATH)}, '/', playlists.cover_id, '.jpg')
                    ELSE NULL
                END AS cover_url
              FROM "playlists"
              INNER JOIN playlist_albums on playlists.id = playlist_albums.playlist_id
              LEFT JOIN library_releases on playlists.id = library_releases.album_id WHERE playlists.type = ${database.sequelize.escape(Type.Album)} 
 
            ) AS releases
            ORDER BY "date_released" DESC
            LIMIT 20
          `,
      { type: QueryTypes.SELECT },
    )) as unknown as RecentRelease[];
    return { success: true, data: recentReleases };
  }
  async getRandomAlbums(): Promise<SuccessfulResult<RandomAlbum[]>> {
    const albumRecords = (await database.playlistModel.scope('albumOnly').findAll({
      order: database.sequelize.random(),
      include: [
        {
          model: database.playlistAlbumsModel,
          attributes: ['date_released'],
        },
      ],
      limit: 20,
    })) as PlaylistAlbumInstanceWithRelations[];
    const processedAlbumRecords = albumRecords.map((albumRecord) => {
      return {
        id: albumRecord.id,
        name: albumRecord.name,
        published: !!albumRecord.playlist_album.date_released,
        date_released: albumRecord.playlist_album.date_released ?? null,
        cover_url: albumRecord.cover_id
          ? `${STATIC_IMAGES_PATH}/${albumRecord.cover_id}.jpg`
          : null,
      };
    });
    return { success: true, data: processedAlbumRecords };
  }
  async getRandomArtists(): Promise<SuccessfulResult<RandomArtist[]>> {
    const artistRecords = await database.userModel.findAll({
      where: { is_artist: true },
      attributes: ['id', 'avatar_url', 'visible_username'],
    });
    const processedArtistRecords = artistRecords.map((row) => {
      return {
        id: row.id,
        visible_username: row.visible_username,
        cover_url: row.avatar_url ? `${STATIC_IMAGES_PATH}/${row.avatar_url}.jpg` : null,
      };
    });
    return { success: true, data: processedArtistRecords };
  }
  async getRandomPlaylists(): Promise<SuccessfulResult<RandomPlaylist[]>> {
    const playlistRecords = (await database.playlistModel.findAll({
      where: { restrictions: Restrictions.Public },
      include: {
        model: database.userModel,
        attributes: ['visible_username'],
      },
      order: database.sequelize.random(),
      limit: 20,
    })) as PlaylistInstanceWithUser[];
    const processedAlbumRecords = playlistRecords.map((row) => {
      return {
        id: row.id,
        name: row.name,
        owner: { id: row.owner, visible_username: row.user.visible_username },
        cover_url: row.cover_id ? `${STATIC_IMAGES_PATH}/${row.cover_id}.jpg` : null,
      };
    });
    return { success: true, data: processedAlbumRecords };
  }
  async getRecentlyPlayed(userId: string): Promise<SuccessfulResult<RecentlyPlayed[]>> {
    // eslint-disable-next-line sonarjs/sql-queries
    const recentlyPlayed = (await database.sequelize.query(
      `
              SELECT *
              FROM (
                SELECT 
                  tracks.id,
                  tracks.name,
                  'single' AS type,
                  (library_releases.id IS NOT NULL) AS is_followed,
                  creation_date AS date_released,
                  library_releases.date_played AS date_played,
                  CASE 
                      WHEN tracks.cover_id IS NOT NULL 
                      THEN CONCAT(${database.sequelize.escape(STATIC_IMAGES_PATH)}, '/', tracks.cover_id, '.jpg')
                      ELSE NULL
                  END AS cover_url
                FROM "tracks"
                INNER JOIN library_releases on tracks.id = library_releases.track_id 
                WHERE library_releases.date_played IS NOT NULL AND library_releases.user_id = ${database.sequelize.escape(userId)}
                
                UNION ALL
            
                SELECT 
                  playlists.id,
                  playlists.name,
                  'album' AS type,
                  (library_releases.id IS NOT NULL) AS is_followed,
                  playlist_albums.date_released AS date_released,
                  library_releases.date_played AS date_played,
                  CASE 
                      WHEN playlists.cover_id IS NOT NULL 
                      THEN CONCAT(${database.sequelize.escape(STATIC_IMAGES_PATH)}, '/', playlists.cover_id, '.jpg')
                      ELSE NULL
                  END AS cover_url
                FROM "playlists"
                INNER JOIN playlist_albums on playlists.id = playlist_albums.playlist_id
                INNER JOIN library_releases on playlists.id = library_releases.album_id 
                WHERE playlists.type = ${database.sequelize.escape(Type.Album)}
                AND library_releases.date_played IS NOT NULL AND library_releases.user_id = ${database.sequelize.escape(userId)}
              ) AS releases
              ORDER BY "date_played" DESC
              LIMIT 9
            `,
      { type: QueryTypes.SELECT },
    )) as unknown as RecentlyPlayed[];
    return { success: true, data: recentlyPlayed };
  }
}
export default DashboardManager;
