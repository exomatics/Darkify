import sequelize, { Op } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_IMAGES_PATH } from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import { AlbumsSortBy } from '../../interfaces/album-interface.ts';
import { ArtistAlbumsSortBy } from '../../interfaces/artist-interface.ts';
import { Order, Restrictions } from '../../interfaces/playlist-interface.ts';

import type { IArtist, ArtistSinglesSortBy } from '../../interfaces/artist-interface.ts';
import type { Result } from '../../types/result-type.ts';
import type { ArtistModel } from '../artists.ts';
import type { PlaylistAlbumsModel } from '../playlist-albums.ts';
import type { PlaylistFollowersModel } from '../playlist-followers.ts';
import type { PlaylistTrackModel } from '../playlist-tracks.ts';
import type { PlaylistModel } from '../playlist.ts';
import type { TrackModel } from '../track.ts';
import type { UserModel } from '../user.ts';
import type { Transaction } from 'sequelize';

interface TracksWithArtists extends TrackModel {
  dataValues: TrackModel['dataValues'] & { total_listens: number };
  users: UserModel[];
}

class ArtistManager {
  async turnToArtist(
    artistInfo: IArtist & {
      transaction: Transaction;
    },
  ): Promise<Result<null, typeof errorMessages.artist.AlreadyExistsById>> {
    const isArtistExists = await database.artistModel.findByPk(artistInfo.userId);
    if (isArtistExists) {
      return { success: false, reason: errorMessages.artist.AlreadyExistsById };
    }
    await database.artistModel.create(
      {
        user_id: artistInfo.userId,
        banner_id: artistInfo.bannerId ?? null,
        description: artistInfo.description ?? null,
      },
      { transaction: artistInfo.transaction },
    );
    return { success: true, data: null };
  }
  async getArtistById(
    artistId: string,
  ): Promise<Result<ArtistModel, typeof errorMessages.artist.NotExistsById>> {
    const artistrow = await database.artistModel.findByPk(artistId);
    if (!artistrow) {
      return { success: false, reason: errorMessages.artist.NotExistsById };
    }
    return { success: true, data: artistrow };
  }
  async getArtistInfo(artistInfo: { artistId: string; userId: string }): Promise<
    Result<
      {
        followers_count: number;
        listening_count: number;
        is_following: boolean;
        liked_songs_count: number;
        description: string | null;
        banner_id: string | null;
      },
      typeof errorMessages.artist.NotExistsById
    >
  > {
    const artistrow = await this.getArtistById(artistInfo.artistId);
    if (!artistrow.success) {
      return artistrow;
    }
    const artistFollowersCount = await database.userFollowersModel.count({
      where: { user_id: artistInfo.artistId },
    });
    const artistListens = (await database.trackModel.findAll({
      attributes: ['id', [sequelize.fn('sum', sequelize.col('play_count')), 'total_listens']],
      group: ['track.id', 'users.id'],
      include: {
        model: database.userModel,
        required: true,
        through: { attributes: [], where: { artist_id: artistInfo.artistId } },
      },
    })) as TracksWithArtists[];
    const isFollowingArtist = await database.userFollowingModel.findOne({
      where: { user_id: artistInfo.userId, following_id: artistInfo.artistId },
    });

    const artistLikedCount = await database.trackModel.count({
      distinct: true,
      include: [
        {
          model: database.userModel,
          through: { where: { artist_id: artistInfo.artistId } },
          required: true,
        },
        {
          model: database.playlistModel,
          where: { id: artistInfo.userId },
          required: true,
        },
      ],
    });
    return {
      success: true,
      data: {
        banner_id: artistrow.data.banner_id,
        description: artistrow.data.description,
        followers_count: artistFollowersCount,
        listening_count: Number(artistListens[0].dataValues.total_listens),
        is_following: !!isFollowingArtist,
        liked_songs_count: artistLikedCount,
      },
    };
  }

  async getLikedFromArtist(
    artistInfo: { artistId: string; userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    Result<
      {
        total: number;
        items: {
          id: string;
          deleted: boolean;
          name: string;
          duration: number;
          lyrics: string | null;
          is_liked: boolean;
          cover_url: string | null;
          playlist_track_id: string;
          date_added: Date | undefined;
          album: PlaylistModel[];
          artists: UserModel[];
        }[];
      },
      typeof errorMessages.artist.NotExistsById
    >
  > {
    const artistRecord = await this.getArtistById(artistInfo.artistId);
    if (!artistRecord.success) {
      return artistRecord;
    }
    const artistLiked = (await database.trackModel.findAndCountAll({
      distinct: true,
      where: {
        id: {
          [Op.in]: sequelize.literal(`(
            SELECT track_artists.track_id
            FROM track_artists 
            WHERE track_artists.artist_id = '${artistInfo.artistId}'
          )`),
        },
      },
      include: [
        {
          model: database.userModel,
          attributes: ['id', 'visible_username'],
          through: { attributes: [] },
          required: false,
        },
        {
          model: database.playlistModel,
          where: { id: artistInfo.userId },
          through: { attributes: ['id', 'date_added'] },
          required: true,
        },
        { association: 'album', required: false, attributes: ['id', 'name'] },
      ],
      limit,
      offset,
    })) as {
      count: number;
      rows: (TrackModel & {
        users: UserModel[];
        playlists: (PlaylistModel & { playlist_track: PlaylistTrackModel })[];
        album: PlaylistModel[];
      })[];
    };
    const proccessedArtistLiked = artistLiked.rows.map((row) => {
      return {
        id: row.id,
        deleted: row.deleted,
        name: row.name,
        duration: row.duration,
        lyrics: row.lyrics,
        is_liked: true,
        cover_url: row.cover_id ? `${STATIC_IMAGES_PATH}/${row.cover_id}.jpg` : null,
        playlist_track_id: row.playlists[0].playlist_track.id,
        date_added: row.playlists[0].playlist_track.date_added,
        album: row.album,
        artists: row.users,
      };
    });
    return { success: true, data: { total: artistLiked.count, items: proccessedArtistLiked } };
  }
  async getArtistAlbums(
    artistInfo: { artistId: string; userId: string },
    sort: { sortBy: ArtistAlbumsSortBy; order: Order },
    limit?: number,
    offset?: number,
  ): Promise<
    Result<
      {
        total: number;
        items: {
          id: string;
          name: string;
          is_followed: boolean;
          cover_url: string | null;
        }[];
      },
      typeof errorMessages.artist.NotExistsById
    >
  > {
    const artistRecord = await this.getArtistById(artistInfo.artistId);
    if (!artistRecord.success) {
      return artistRecord;
    }

    type PlaylistAlbumInstanceWithRelations = PlaylistModel & {
      playlist_album: PlaylistAlbumsModel;
      playlist_followers?: PlaylistFollowersModel[];
      tracks?: TrackModel[];
    };
    let attributes: sequelize.FindAttributeOptions = ['id', 'name', 'cover_id'];

    let include: sequelize.Includeable[] = [
      {
        model: database.playlistAlbumsModel,
        where: { date_released: { [Op.not]: null } },
        attributes: ['date_released'],

        required: true,
        // required: true,
        // right: true,
        // through: { attributes: ['playlist_id'] },
      },

      {
        model: database.playlistFollowersModel,
        required: false,
        where: { user_id: artistInfo.userId },
      },
    ];
    let group: sequelize.GroupOption = [
      'playlist.id',
      'playlist_album.playlist_id',
      'playlist_followers.playlist_id',
      'playlist_followers.user_id',
    ];
    if (sort.sortBy === ArtistAlbumsSortBy.Popularity) {
      include = [
        ...include,
        {
          model: database.trackModel,
          attributes: ['play_count'],
        },
      ];
      attributes = [
        'id',
        'name',
        'cover_id',
        [sequelize.fn('sum', sequelize.col('tracks.play_count')), 'total_listens'],
      ];
      group = [
        'playlist.id',
        'playlist_album.playlist_id',
        'playlist_followers.playlist_id',
        'playlist_followers.user_id',
        'tracks.id',
        'tracks->playlist_track.id',
        'tracks->playlist_track.playlist_id',
        'tracks->playlist_track.track_id',
        'tracks->playlist_track.order',
      ];
    }
    const artistAlbumsCount = await database.playlistModel.count({
      where: { owner: artistInfo.artistId, restrictions: Restrictions.Public },
    });
    const artistAlbumsRecords = (await database.playlistModel.findAll({
      where: { owner: artistInfo.artistId, restrictions: Restrictions.Public },
      subQuery: false,
      group,
      attributes,
      // raw: true,
      // nest: true,
      order: [
        [
          { model: database.playlistAlbumsModel, as: 'playlist_album' },
          AlbumsSortBy.Released,
          Order.Desc,
        ],
      ],
      include,
      limit: limit ?? undefined,
      offset: offset ?? undefined,
    })) as PlaylistAlbumInstanceWithRelations[];
    const processedAlbumsRecords = artistAlbumsRecords.map((albumRecord) => {
      return {
        id: albumRecord.id,
        name: albumRecord.name,
        is_followed: Boolean(albumRecord.playlist_followers?.length),
        cover_url: albumRecord.cover_id
          ? `${STATIC_IMAGES_PATH}/${albumRecord.cover_id}.jpg`
          : null,
      };
    });
    return {
      success: true,
      data: { total: artistAlbumsCount, items: processedAlbumsRecords },
    };
  }
  async getArtistSingles(
    artistInfo: { artistId: string; userId: string },
    sort: { sortBy: ArtistSinglesSortBy; order: Order },
    limit?: number,
    offset?: number,
  ): Promise<
    Result<
      {
        total: number;
        items: {
          id: string;
          deleted: boolean;
          name: string;
          duration: number;
          lyrics: string | null;
          is_liked: boolean;
          cover_url: string | null;
          date_released: Date | undefined;
          artists: UserModel[];
        }[];
      },
      typeof errorMessages.artist.NotExistsById
    >
  > {
    const artistRecord = await this.getArtistById(artistInfo.artistId);
    if (!artistRecord.success) {
      return artistRecord;
    }
    const artistSingles = (await database.trackModel.findAndCountAll({
      distinct: true,
      where: {
        admin_id: artistInfo.artistId,
        // id: {
        //   [Op.in]: sequelize.literal(`(
        //     SELECT track_artists.track_id
        //     FROM track_artists
        //     WHERE track_artists.artist_id = '${artistInfo.artistId}'
        //   )`),
        // },
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!that's for appears on
        album_id: { [Op.is]: null },
      },
      order: [[sort.sortBy, sort.order]],
      include: [
        {
          model: database.userModel,
          attributes: ['id', 'visible_username'],
          through: { attributes: [] },
          required: false,
        },
        {
          model: database.playlistModel,
          where: { id: artistInfo.userId },
          required: false,
          through: { attributes: ['id', 'date_added'] },
        },
      ],
      limit: limit ?? undefined,
      offset: offset ?? undefined,
    })) as {
      count: number;
      rows: (TrackModel & {
        users: UserModel[];
        playlists?: (PlaylistModel & { playlist_track: PlaylistTrackModel })[];
      })[];
    };
    const proccessedArtistSingles = artistSingles.rows.map((row) => {
      return {
        id: row.id,
        deleted: row.deleted,
        name: row.name,
        duration: row.duration,
        lyrics: row.lyrics,
        is_liked: Boolean(row.playlists?.length),
        cover_url: row.cover_id ? `${STATIC_IMAGES_PATH}/${row.cover_id}.jpg` : null,
        date_released: row.creation_date,
        artists: row.users,
      };
    });
    return {
      success: true,
      data: { total: artistSingles.count, items: proccessedArtistSingles },
    };
  }
  async getArtistTop(
    artistInfo: { artistId: string; userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    Result<
      {
        total: number;
        items: {
          id: string;
          deleted: boolean;
          name: string;
          duration: number;
          lyrics: string | null;
          is_liked: boolean;
          cover_url: string | null;
          date_released: Date | undefined;
          album?: PlaylistModel[] | { id: string; name: string };
          artists: UserModel[];
        }[];
      },
      typeof errorMessages.artist.NotExistsById
    >
  > {
    const artistRecord = await this.getArtistById(artistInfo.artistId);
    if (!artistRecord.success) {
      return artistRecord;
    }
    const artistTopTracks = (await database.trackModel.findAndCountAll({
      distinct: true,
      where: {
        id: {
          [Op.in]: sequelize.literal(`(
            SELECT track_artists.track_id
            FROM track_artists 
            WHERE track_artists.artist_id = '${artistInfo.artistId}'
          )`),
        },
      },
      order: [['play_count', Order.Desc]],
      include: [
        {
          model: database.userModel,
          attributes: ['id', 'visible_username'],
          through: { attributes: [] },
          required: false,
        },
        {
          model: database.playlistModel,
          where: { id: artistInfo.userId },
          through: { attributes: ['id', 'date_added'] },
          required: false,
        },
        { association: 'album', required: false, attributes: ['id', 'name'] },
      ],
      limit,
      offset,
    })) as {
      count: number;
      rows: (TrackModel & {
        users: UserModel[];
        playlists?: (PlaylistModel & { playlist_track: PlaylistTrackModel })[];
        album?: PlaylistModel[];
      })[];
    };
    const proccessedArtistLiked = artistTopTracks.rows.map((row) => {
      return {
        id: row.id,
        deleted: row.deleted,
        name: row.name,
        duration: row.duration,
        lyrics: row.lyrics,
        is_liked: Boolean(row.playlists?.length),
        cover_url: row.cover_id ? `${STATIC_IMAGES_PATH}/${row.cover_id}.jpg` : null,
        date_released: row.creation_date,
        album: row.album ?? { id: row.id, name: row.name },
        artists: row.users,
      };
    });
    return { success: true, data: { total: artistTopTracks.count, items: proccessedArtistLiked } };
  }
}
export default ArtistManager;
