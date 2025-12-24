import _ from 'lodash';
import sequelize, { Op } from 'sequelize';

import {
  albumOrderOptions,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  ORDER_NUMBER,
  playlistOrderOptions,
  STATIC_IMAGES_PATH,
} from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';
import { AlbumsSortBy } from '../../interfaces/album-interface.ts';
import { LibrarySortBy } from '../../interfaces/library-interface.ts';
import { Type, Restrictions, PlaylistSortBy, Order } from '../../interfaces/playlist-interface.ts';

import type { AlbumSpecificSortBy } from '../../interfaces/album-interface.ts';
import type {
  ICreatePlaylist,
  IPlaylist,
  IReorder,
  IUpdatePlaylist,
} from '../../interfaces/playlist-interface.ts';
import type { Itrack } from '../../interfaces/track-interface.ts';
import type { Result, SuccessfulResult } from '../../types/result-type.ts';
import type { LibraryPlaylistsModel } from '../library-playlists.ts';
import type { PlaylistAlbumsModel } from '../playlist-albums.ts';
import type { PlaylistTrackModel } from '../playlist-tracks.ts';
import type { PlaylistModel } from '../playlist.ts';
import type { TrackModel } from '../track.ts';
import type { UserModel } from '../user.ts';
import type { Transaction } from 'sequelize';

interface PlaylistTotalCount extends PlaylistModel {
  dataValues: PlaylistModel['dataValues'] & { total_duration: string };
}

interface IGetPlaylistsByName extends PlaylistModel {
  dataValues: PlaylistModel['dataValues'] & { owner_username: string };
}

type IPlaylistInfo = Omit<IPlaylist, 'playlistId' | 'type'> & {
  totalDuration: number;
  songsCount: number;
  isOwner: boolean;
};
type PlaylistTrackInstanceWithRelations = PlaylistTrackModel & {
  track: TrackModel & {
    users: UserModel[];
    album: PlaylistModel | null;
  };
};

type DeleteAlbumErrors =
  | typeof errorMessages.playlist.NotExistsById
  | typeof errorMessages.liked.CantDelete
  | typeof errorMessages.album.NotExistsById
  | typeof errorMessages.album.playlistAlbumRecordNotExists;

class PlaylistManager {
  async createPlaylist(
    playlistInfo: ICreatePlaylist & Pick<IPlaylist, 'restrictions'> & { coverId?: string | null },
  ): Promise<SuccessfulResult<{ playlistId: string; userId: string }>> {
    let playlistRecord: Partial<PlaylistModel> = {};
    try {
      await database.sequelize.transaction(async (transaction) => {
        const playlistCount = await database.playlistModel.count({
          where: { owner: playlistInfo.owner },
          transaction,
        });
        const defaultPlaylistName =
          playlistInfo.type === Type.Liked
            ? `Liked Songs`
            : `My Playlist ${String(playlistCount + 1)}`;
        const localPlaylistRecord = await database.playlistModel.create(
          {
            id: playlistInfo.playlistId,
            name: playlistInfo.name ?? defaultPlaylistName,
            description: playlistInfo.description ?? null,
            cover_id: playlistInfo.coverId ?? null,
            owner: playlistInfo.owner,
            restrictions: playlistInfo.restrictions,
            type: playlistInfo.type ?? Type.General,
          },
          { transaction },
        );
        await this.createLibraryRecord(
          localPlaylistRecord.owner,
          localPlaylistRecord.id,
          transaction,
        );
        playlistRecord = localPlaylistRecord;
      });
    } catch {
      throw new InternalError('failed to create playlist');
    }
    return {
      success: true,
      data: { playlistId: playlistRecord.id ?? '', userId: playlistRecord.owner ?? '' },
    };
  }
  async createPlaylistAlbum(albumInfo: {
    playlistId: string;
    userId: string;
  }): Promise<Result<null, typeof errorMessages.album.NotExistsById>> {
    const albumRecord = await this.getUserAlbumRecordById(albumInfo.playlistId, albumInfo.userId);
    if (!albumRecord.success) {
      return albumRecord;
    }
    await database.playlistAlbumsModel.create({
      playlist_id: albumInfo.playlistId,
      date_released: null,
    });
    return { success: true, data: null };
  }
  async deletePlaylist(playlistInfo: {
    playlistId: string;
    userId: string;
    transaction?: Transaction;
  }): Promise<
    Result<
      null,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.liked.CantDelete
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.type === Type.Liked) {
      return { success: false, reason: errorMessages.liked.CantDelete };
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await playlistRecord.data.destroy({ transaction: playlistInfo.transaction ?? transaction });
        await this.deleteLibraryRecord(
          playlistInfo.userId,
          playlistInfo.playlistId,
          playlistInfo.transaction ?? transaction,
        );
        await database.playlistTrackModel.destroy({
          where: { playlist_id: playlistInfo.playlistId },
          transaction: playlistInfo.transaction ?? transaction,
        });
      });
    } catch {
      throw new InternalError('failed to delete playlist');
    }
    return { success: true, data: null };
  }
  async deleteAllTracksFromAlbum(playlistInfo: {
    playlistId: string;
    userId: string;
    keepTracks?: boolean;
    transaction: Transaction;
  }): Promise<Result<null, typeof errorMessages.album.NotExistsById>> {
    const playlistRecord = await this.getUserAlbumRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    await database.trackModel.update(
      { deleted: true },
      { where: { album_id: playlistInfo.playlistId }, transaction: playlistInfo.transaction },
    );
    return { success: true, data: null };
  }
  async deleteAlbum(playlistInfo: {
    playlistId: string;
    keepTracks?: boolean;
    userId: string;
  }): Promise<Result<null, DeleteAlbumErrors>> {
    let result: Result<null, DeleteAlbumErrors> = { success: true, data: null };
    try {
      await database.sequelize.transaction(async (transaction) => {
        if (!playlistInfo.keepTracks) {
          const deleteTracksResponse = await this.deleteAllTracksFromAlbum({
            ...playlistInfo,
            transaction,
          });
          if (!deleteTracksResponse.success) {
            result = deleteTracksResponse;
            return;
          }
        }
        const playlistResponse = await this.deletePlaylist({ ...playlistInfo, transaction });
        if (!playlistResponse.success) {
          result = playlistResponse;
          return;
        }
        const playlistAlbumResponse = await this.deletePlaylistAlbumRecord({
          albumId: playlistInfo.playlistId,
          userId: playlistInfo.userId,
          transaction,
        });
        if (!playlistAlbumResponse.success) {
          result = playlistAlbumResponse;
          return;
        }
        result = { success: true, data: null };
      });
    } catch {
      throw new InternalError('failed to delete album');
    }
    return result;
  }
  async deletePlaylistAlbumRecord(albumInfo: {
    userId: string;
    albumId: string;
    transaction: Transaction;
  }): Promise<
    Result<
      null,
      | typeof errorMessages.album.NotExistsById
      | typeof errorMessages.album.playlistAlbumRecordNotExists
    >
  > {
    const playlistRecord = await this.getUserAlbumRecordById(albumInfo.albumId, albumInfo.userId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    const playlistAlbumRecord = await this.getPlaylistAlbumRecord(albumInfo.albumId);
    if (!playlistAlbumRecord.success) {
      return playlistAlbumRecord;
    }
    await playlistAlbumRecord.data.destroy({ transaction: albumInfo.transaction });
    return { success: true, data: null };
  }
  async getPlaylistRecordById(
    playlistId: string,
    userId: string,
  ): Promise<Result<PlaylistModel, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    if (!playlistRecord) {
      return { success: false, reason: errorMessages.playlist.NotExistsById };
    }
    if (playlistRecord.restrictions === Restrictions.Private && playlistRecord.owner !== userId) {
      return { success: false, reason: errorMessages.playlist.NotExistsById };
    }
    return { success: true, data: playlistRecord };
  }
  async getPlaylistTrackRecordById(
    playlistTrackId: string,
  ): Promise<Result<PlaylistTrackModel, typeof errorMessages.playlist.playlistTrackNotExistsByID>> {
    const playlistTrackRecord = await database.playlistTrackModel.findByPk(playlistTrackId);
    if (!playlistTrackRecord) {
      return { success: false, reason: errorMessages.playlist.playlistTrackNotExistsByID };
    }
    return { success: true, data: playlistTrackRecord };
  }
  async getUserAlbumRecordById(
    playlistId: string,
    userId: string,
  ): Promise<Result<PlaylistModel, typeof errorMessages.album.NotExistsById>> {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    if (!playlistRecord || playlistRecord.owner !== userId || playlistRecord.type !== Type.Album) {
      return { success: false, reason: errorMessages.album.NotExistsById };
    }
    return { success: true, data: playlistRecord };
  }
  async getAlbumRecordById(
    playlistId: string,
    userId: string,
  ): Promise<
    Result<
      PlaylistModel,
      typeof errorMessages.album.NotExistsById | typeof errorMessages.album.AlbumIsNotAnAlbum
    >
  > {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    if (!playlistRecord) {
      return { success: false, reason: errorMessages.album.NotExistsById };
    }
    if (playlistRecord.restrictions === Restrictions.Private && playlistRecord.owner !== userId) {
      return { success: false, reason: errorMessages.album.NotExistsById };
    }
    if (playlistRecord.type !== Type.Album) {
      return { success: false, reason: errorMessages.album.AlbumIsNotAnAlbum };
    }
    return { success: true, data: playlistRecord };
  }
  async getPlaylistAlbumRecord(
    albumId: string,
  ): Promise<Result<PlaylistAlbumsModel, typeof errorMessages.album.playlistAlbumRecordNotExists>> {
    const playlistAlbumRecord = await database.playlistAlbumsModel.findByPk(albumId);
    if (!playlistAlbumRecord) {
      return { success: false, reason: errorMessages.album.playlistAlbumRecordNotExists };
    }
    return { success: true, data: playlistAlbumRecord };
  }
  async IsTrackExistsById(playlistInfo: {
    playlistId: string;
    trackId: string;
    userId: string;
  }): Promise<
    Result<
      null,
      | typeof errorMessages.playlist.NotExistsById
      | typeof errorMessages.playlist.IsNotAnOwner
      | typeof errorMessages.playlist.TrackNotExistsById
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      where: {
        [Op.and]: [{ playlist_id: playlistInfo.playlistId }, { track_id: playlistInfo.trackId }],
      },
    });
    if (!playlistTrackRecord) {
      return { success: false, reason: errorMessages.playlist.TrackNotExistsById };
    }

    return { success: true, data: null };
  }
  async addTrackToPlaylist(playlistTrackInfo: {
    playlistId: string;
    trackId: string;
    playlistTrackId: string;
    userId: string;
    transaction?: Transaction;
  }): Promise<
    Result<
      { playlistTrackId: string },
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistTrackInfo.playlistId,
      playlistTrackInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistTrackInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        const maxOrder = await database.playlistTrackModel.max('order', {
          where: {
            playlist_id: playlistTrackInfo.playlistId,
            [Op.and]: [
              sequelize.where(
                sequelize.fn('MOD', sequelize.col('order'), String(ORDER_NUMBER)),
                '=',
                '0',
              ),
            ],
          },
          transaction: playlistTrackInfo.transaction ?? transaction,
        });
        await database.playlistTrackModel.create(
          {
            playlist_id: playlistTrackInfo.playlistId,
            id: playlistTrackInfo.playlistTrackId,
            track_id: playlistTrackInfo.trackId,
            order: typeof maxOrder === 'number' ? maxOrder + ORDER_NUMBER : ORDER_NUMBER,
          },
          { transaction: playlistTrackInfo.transaction ?? transaction },
        );
        await database.playlistModel.update(
          { tracks_count: (playlistRecord.data.tracks_count ?? 0) + 1 },
          {
            where: { id: playlistRecord.data.id },
            transaction: playlistTrackInfo.transaction ?? transaction,
          },
        );
      });
    } catch {
      throw new InternalError('failed to add track');
    }
    return { success: true, data: { playlistTrackId: playlistTrackInfo.playlistTrackId } };
  }
  async removeTrackfromPlaylist(playlistTrackInfo: {
    playlistId: string;
    playlistTrackId: string;
    userId: string;
    transaction?: Transaction;
  }): Promise<
    Result<
      null,
      | typeof errorMessages.playlist.IsNotAnOwner
      | typeof errorMessages.playlist.TrackNotExistsByIndex
      | typeof errorMessages.playlist.NotExistsById
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistTrackInfo.playlistId,
      playlistTrackInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistTrackInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      where: {
        playlist_id: playlistTrackInfo.playlistId,
        id: playlistTrackInfo.playlistTrackId,
      },
    });
    if (!playlistTrackRecord) {
      return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
    }

    try {
      await database.sequelize.transaction(async (transaction) => {
        await playlistTrackRecord.destroy({
          transaction: playlistTrackInfo.transaction ?? transaction,
        });

        await database.playlistModel.update(
          { tracks_count: (playlistRecord.data.tracks_count ?? 0) - 1 },
          {
            where: { id: playlistRecord.data.id },
            transaction: playlistTrackInfo.transaction ?? transaction,
          },
        );
      });
    } catch {
      throw new InternalError('failed to remove track');
    }

    return { success: true, data: null };
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //make sortby and order in enum
  async getAllTracksFromPlaylist(
    playlistInfo: {
      playlistId: string;
      userId: string;
      sort: { sortBy: PlaylistSortBy | AlbumSpecificSortBy; order: Order };
      type?: Type;
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    SuccessfulResult<{
      items: (Pick<Itrack, 'deleted' | 'name' | 'duration'> & {
        id: string;
        playlist_track_id?: string;
        album_track_id?: string;
        date_added: Date | null;
        cover_url: string | null;
        artists: { id: string; visible_username: string }[];
        is_liked?: boolean;
      })[];
      total: number;
    }>
  > {
    const orderOptions =
      playlistInfo.type === Type.Album ? albumOrderOptions : playlistOrderOptions;

    const playlistTracks = (await database.playlistTrackModel.findAndCountAll({
      where: { playlist_id: playlistInfo.playlistId },
      attributes: ['id', 'playlist_id', 'track_id', 'order', 'date_added'],
      order: [
        [...orderOptions[playlistInfo.sort.sortBy], playlistInfo.sort.order],
      ] as sequelize.Order,
      distinct: true,
      subQuery: false,
      include: [
        {
          model: database.trackModel,
          required: true,
          attributes: ['id', 'deleted', 'name', 'duration', 'lyrics', 'cover_id', 'play_count'],
          include: [
            {
              model: database.userModel,
              through: { attributes: [] },
              attributes: ['id', 'visible_username'],
            },
            {
              association: 'album',
              attributes: ['id', 'name'],
            },
          ],
        },
        { model: database.playlistModel, required: true },
      ],
      offset,
      limit,
    })) as { rows: PlaylistTrackInstanceWithRelations[]; count: number };

    const processedPlaylistRows = playlistTracks.rows.map(
      (row: PlaylistTrackInstanceWithRelations) => {
        const basePlaylistRow = {
          deleted: row.track.deleted ?? false,
          name: row.track.name,
          duration: row.track.duration,
          lyrics: row.track.lyrics,
          cover_url: row.track.cover_id ? `${STATIC_IMAGES_PATH}/${row.track.cover_id}.jpg` : null,
          album: row.track.album ?? { id: row.track.id, name: row.track.name },
          id: row.track_id,
          date_added: row.date_added ?? null,
          artists: row.track.users,
        };
        if (playlistInfo.type === Type.Liked) {
          return {
            ...basePlaylistRow,
            is_liked: true,
            playlist_track_id: row.id,
          };
        }
        // eslint-disable-next-line unicorn/prefer-ternary
        if (playlistInfo.type === Type.Album) {
          return {
            ...basePlaylistRow,
            play_count: row.track.play_count,
            album_track_id: row.id,
          };
        } else {
          return {
            ...basePlaylistRow,
            playlist_track_id: row.id,
          };
        }
      },
    );
    return {
      success: true,
      data: { total: playlistTracks.count, items: processedPlaylistRows },
    };
  }
  async searchForPlaylistTrack(
    searchInfo: {
      search: string;
      playlistId: string;
      userId: string;
      sort: { sortBy: PlaylistSortBy; order: Order };
      isLiked?: boolean;
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    SuccessfulResult<{
      items: (Pick<Itrack, 'deleted' | 'name' | 'duration'> & {
        id: string;
        playlist_track_id: string;
        date_added: Date | null;
        cover_url: string | null;
        artists: { id: string; visible_username: string }[];
        is_liked?: true;
      })[];
      total: number;
    }>
  > {
    const searchPattern = `%${searchInfo.search}%`;
    const playlistTracks = (await database.playlistTrackModel.findAndCountAll({
      attributes: ['id', 'date_added'],
      where: {
        playlist_id: searchInfo.playlistId,
      },
      order: [
        [...playlistOrderOptions[searchInfo.sort.sortBy], searchInfo.sort.order],
      ] as sequelize.Order,
      distinct: true,
      // group: ['id', 'playlist_id', 'track_id', 'order'],
      include: [
        {
          model: database.trackModel,
          // required: false,
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: searchPattern } },
              { lyrics: { [Op.iLike]: searchPattern } },
              sequelize.literal(`
                EXISTS (
                  SELECT 1
                  FROM "track_artists" ta
                  JOIN "users" u ON u.id = ta.artist_id
                  WHERE ta.track_id = "track"."id"
                    AND u.visible_username ILIKE ${database.sequelize.escape(searchPattern)}
                )
              `),
            ],
            // [(database.userModel, sequelize.col('visible_username'))]: {
            //   [Op.iLike]: searchInfo.search,
            // },
          },
          include: [
            {
              model: database.userModel,
              attributes: ['id', 'visible_username'],
              through: { attributes: [] },
              // where: { visible_username: { [Op.iLike]: `%${searchInfo.search}%` } },
              // required: false,
            },
            { association: 'album' },
          ],
        },
      ],
      offset,
      limit,
    })) as {
      rows: PlaylistTrackInstanceWithRelations[];
      count: number;
    };
    const processedPlaylistTracks = searchInfo.isLiked
      ? playlistTracks.rows.map((row) => {
          return {
            ..._.omit(row.track.dataValues, ['users', 'cover_id', 'admin_id']),
            playlist_track_id: row.id,
            date_added: row.date_added ?? null,
            id: row.track.id,
            name: row.track.name,
            lyrics: row.track.lyrics,
            play_count: row.track.play_count,
            deleted: row.track.deleted,
            album: row.track.album ?? { id: row.track.id, name: row.track.name },
            duration: row.track.duration,
            is_liked: true,
            creation_date: row.track.creation_date ?? null,
            cover_url: row.track.cover_id
              ? `${STATIC_IMAGES_PATH}/${row.track.cover_id}.jpg`
              : null,
            artists: [...row.track.users],
          };
        })
      : playlistTracks.rows.map((row) => {
          return {
            ..._.omit(row.track.dataValues, ['users', 'cover_id', 'admin_id']),
            playlist_track_id: row.id,
            date_added: row.date_added ?? null,
            id: row.track.id,
            name: row.track.name,
            lyrics: row.track.lyrics,
            play_count: row.track.play_count,
            deleted: row.track.deleted,
            duration: row.track.duration,
            creation_date: row.track.creation_date ?? null,
            cover_url: row.track.cover_id
              ? `${STATIC_IMAGES_PATH}/${row.track.cover_id}.jpg`
              : null,
            artists: [...row.track.users],
          };
        });

    return { success: true, data: { items: processedPlaylistTracks, total: playlistTracks.count } };
  }
  async getPlaylistsByName(
    playlistInfo: Pick<IPlaylist, 'name'> & { userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    SuccessfulResult<{
      total: number;
      items: (Omit<IPlaylist, 'playlistId' | 'owner' | 'coverId'> & {
        placeholder_url_covers: string[] | null;
        owner: {
          id: string;
          visible_username: string;
        };
        cover_url: string | null;
      })[];
    }>
  > {
    const playlistsRecords = (await database.playlistModel.findAndCountAll({
      attributes: [
        'id',
        'cover_id',
        'name',
        'owner',
        // [sequelize.col('user.visible_username'), 'visible_username'],
        [sequelize.col('user.visible_username'), 'owner_username'],
      ],
      where: {
        name: { [Op.iLike]: `%${playlistInfo.name}%` },
        [Op.or]: { restrictions: Restrictions.Public, owner: playlistInfo.userId },
      },
      order: [[sequelize.literal(`owner = '${playlistInfo.userId}'`), 'DESC']],
      include: [
        {
          model: database.userModel,
          attributes: [],
        },
      ],
      offset,
      limit,
    })) as unknown as {
      rows: IGetPlaylistsByName[];
      count: number;
    };
    const proccessedPlaylistRecords = await Promise.all(
      playlistsRecords.rows.map(async (playlistRecord) => {
        // let isPlaceholderCovers = false;
        // if (!playlistRecord.cover_id && Number(playlistRecord.dataValues.tracks_count) > 3) {
        //   isPlaceholderCovers = true;
        // }
        let placeholderUrlCovers: string[] = [];
        const playlistTracks = await this.getAllTracksFromPlaylist(
          {
            playlistId: playlistRecord.id,
            userId: playlistInfo.userId,
            sort: { sortBy: PlaylistSortBy.Date, order: Order.Asc },
          },
          4,
          0,
        );
        playlistTracks.data.items.forEach((playlistTrack) => {
          if (playlistTrack.cover_url === null) {
            return;
          }

          if (placeholderUrlCovers.includes(playlistTrack.cover_url)) {
            placeholderUrlCovers = [placeholderUrlCovers[0]];
            return;
          }
          placeholderUrlCovers.push(playlistTrack.cover_url);
        });
        if (placeholderUrlCovers.length !== 4 && placeholderUrlCovers.length > 0) {
          placeholderUrlCovers = [placeholderUrlCovers[0]];
        }
        return {
          ..._.omit(playlistRecord.dataValues, 'cover_id', 'owner_username'),
          placeholder_url_covers: placeholderUrlCovers.length === 0 ? null : placeholderUrlCovers,
          owner: {
            id: playlistRecord.owner,
            visible_username: playlistRecord.dataValues.owner_username,
          },
          cover_url: playlistRecord.dataValues.cover_id
            ? `${STATIC_IMAGES_PATH}/${playlistRecord.dataValues.cover_id}.jpg`
            : null,
        };
      }),
    );

    return {
      success: true,
      data: { total: playlistsRecords.count, items: proccessedPlaylistRecords },
    };
  }
  async getAlbumsByOwner(
    userId: string,
    sort: { sortBy: AlbumsSortBy; order: Order },
    limit?: number,
    offset?: number,
  ): Promise<
    SuccessfulResult<{
      total: number;
      items: {
        id: string;
        name: string;
        cover_url: string | null;
      }[];
    }>
  > {
    type PlaylistAlbumInstanceWithRelations = PlaylistModel & {
      playlist_album: PlaylistAlbumsModel;
    };

    const order = (
      sort.sortBy === AlbumsSortBy.Released
        ? [[database.playlistAlbumsModel, sort.sortBy, sort.order]]
        : [[sort.sortBy, sort.order]]
    ) as sequelize.Order;
    const playlistRecords = (await database.playlistModel.scope('albumOnly').findAndCountAll({
      where: { owner: userId },
      order,
      include: [
        {
          model: database.playlistAlbumsModel,
          attributes: ['date_released'],

          // required: true,
          // right: true,
          // through: { attributes: ['playlist_id'] },
        },
      ],
      offset,
      limit,
    })) as { rows: PlaylistAlbumInstanceWithRelations[]; count: number };
    const processedPlaylistRecords = playlistRecords.rows.map((albumRecord) => {
      let published = true;
      if (albumRecord.playlist_album.date_released === null) {
        published = false;
      }
      return {
        id: albumRecord.id,
        name: albumRecord.name,
        published,
        date_released: albumRecord.playlist_album.date_released,
        cover_url: albumRecord.cover_id
          ? `${STATIC_IMAGES_PATH}/${albumRecord.cover_id}.jpg`
          : null,
      };
    });
    return {
      success: true,
      data: { total: playlistRecords.count, items: processedPlaylistRecords },
    };
  }

  async updateAlbumReleaseDate(albumInfo: {
    userId: string;
    albumId: string;
    releaseDate?: Date | null;
  }): Promise<
    Result<
      null,
      | typeof errorMessages.album.NotExistsById
      | typeof errorMessages.album.playlistAlbumRecordNotExists
    >
  > {
    const playlistRecord = await this.getUserAlbumRecordById(albumInfo.albumId, albumInfo.userId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    const playlistAlbumRecord = await this.getPlaylistAlbumRecord(albumInfo.albumId);
    if (!playlistAlbumRecord.success) {
      return playlistAlbumRecord;
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await database.playlistAlbumsModel.update(
          { date_released: albumInfo.releaseDate ?? playlistAlbumRecord.data.date_released },
          {
            where: { playlist_id: albumInfo.albumId },
            transaction,
          },
        );
        await database.playlistModel.update(
          { restrictions: Restrictions.Public },
          {
            where: { id: albumInfo.albumId },
            transaction,
          },
        );
      });
    } catch {
      throw new InternalError('failed to update release date of the album');
    }
    return { success: true, data: null };
  }
  async updateLibraryPlayDate(
    userId: string,
    playlistId: string,
  ): Promise<Result<null, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await this.getPlaylistRecordById(playlistId, userId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    await database.libraryPlaylists.update(
      { date_played: sequelize.fn('NOW') },
      { where: { user_id: userId, playlist_id: playlistId } },
    );
    return { success: true, data: null };
  }
  async updateRestrictionsById(
    playlistInfo: Pick<IPlaylist, 'playlistId' | 'restrictions'> & { userId: string },
  ): Promise<
    Result<
      IPlaylistInfo,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }

    await playlistRecord.data.update({
      restrictions: playlistInfo.restrictions,
    });

    const updatedPlaylistInfo = await this.getPlaylistInfo({
      playlistId: playlistRecord.data.id,
      userId: playlistRecord.data.owner,
    });
    if (!updatedPlaylistInfo.success) {
      return updatedPlaylistInfo;
    }

    return { success: true, data: updatedPlaylistInfo.data };
  }
  async updateCoverById(
    playlistInfo: Pick<IPlaylist, 'playlistId' | 'coverId'> & { userId: string },
  ): Promise<
    Result<
      IPlaylistInfo,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }

    await playlistRecord.data.update({
      cover_id: playlistInfo.coverId ?? playlistRecord.data.cover_id,
    });

    const updatedPlaylistInfo = await this.getPlaylistInfo({
      playlistId: playlistRecord.data.id,
      userId: playlistRecord.data.owner,
    });
    if (!updatedPlaylistInfo.success) {
      return updatedPlaylistInfo;
    }

    return { success: true, data: updatedPlaylistInfo.data };
  }
  async updatePlaylistInfo(
    playlistInfo: IUpdatePlaylist & { userId: string },
  ): Promise<
    Result<
      IPlaylistInfo,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
    await playlistRecord.data.update({
      name: playlistInfo.name ?? playlistRecord.data.name,
      description: playlistInfo.description ?? playlistRecord.data.description,
    });
    const updatedPlaylistInfo = await this.getPlaylistInfo({
      playlistId: playlistRecord.data.id,
      userId: playlistRecord.data.owner,
    });
    if (!updatedPlaylistInfo.success) {
      return updatedPlaylistInfo;
    }

    return { success: true, data: updatedPlaylistInfo.data };
  }

  async getPlaylistInfo(playlistInfo: {
    playlistId: string;
    userId: string;
  }): Promise<
    Result<
      IPlaylistInfo & { isPlaceholderCovers: boolean },
      typeof errorMessages.playlist.NotExistsById
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    const totalDurationRecord = (await database.playlistModel.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('tracks.duration')), 'total_duration']],
      subQuery: false,
      group: [sequelize.col('playlist.id')],
      where: { id: playlistInfo.playlistId },
      include: [
        {
          model: database.trackModel,
          attributes: [],
          through: { attributes: [] },
        },
      ],
    })) as PlaylistTotalCount[];
    const totalDuration = totalDurationRecord[0].dataValues.total_duration;
    const songsCount = await database.playlistTrackModel.count({
      where: { playlist_id: playlistInfo.playlistId },
    });
    let isPlaceholderCovers = false;
    if (!playlistRecord.data.cover_id && songsCount > 3) {
      isPlaceholderCovers = true;
    }

    const responseData = {
      name: playlistRecord.data.name,
      description: playlistRecord.data.description,
      totalDuration: Number(totalDuration) || 0,
      coverId: playlistRecord.data.cover_id,
      isPlaceholderCovers,
      owner: playlistRecord.data.owner,
      restrictions: playlistRecord.data.restrictions,
      type: playlistRecord.data.type,
      songsCount,
      isOwner: playlistRecord.data.owner === playlistInfo.userId,
    };
    return { success: true, data: responseData };
  }

  async getAlbumInfo(albumInfo: {
    playlistId: string;
    userId: string;
  }): Promise<
    Result<
      IPlaylistInfo & { date_released: Date | null },
      | typeof errorMessages.album.NotExistsById
      | typeof errorMessages.album.AlbumIsNotAnAlbum
      | typeof errorMessages.album.playlistAlbumRecordNotExists
    >
  > {
    const playlistRecord = await this.getAlbumRecordById(albumInfo.playlistId, albumInfo.userId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    const playlistAlbumRecord = await this.getPlaylistAlbumRecord(albumInfo.playlistId);
    if (!playlistAlbumRecord.success) {
      return playlistAlbumRecord;
    }
    const totalDurationRecord = (await database.playlistModel.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('tracks.duration')), 'total_duration']],
      subQuery: false,
      group: [sequelize.col('playlist.id')],
      where: { id: albumInfo.playlistId },
      include: [
        {
          model: database.trackModel,
          attributes: [],
          through: { attributes: [] },
        },
      ],
    })) as PlaylistTotalCount[];
    const totalDuration = totalDurationRecord[0].dataValues.total_duration;
    const songsCount = await database.playlistTrackModel.count({
      where: { playlist_id: albumInfo.playlistId },
    });

    const responseData = {
      name: playlistRecord.data.name,
      description: playlistRecord.data.description,
      totalDuration: Number(totalDuration) || 0,
      coverId: playlistRecord.data.cover_id,
      date_released: playlistAlbumRecord.data.date_released ?? null,
      owner: playlistRecord.data.owner,
      restrictions: playlistRecord.data.restrictions,
      type: playlistRecord.data.type,
      songsCount,
      isOwner: playlistRecord.data.owner === albumInfo.userId,
    };
    return { success: true, data: responseData };
  }

  async getLibraryPlaylistRecord(playlistId: string, userId: string) {
    const playlisLibrarytRecord = await database.libraryPlaylists.findOne({
      where: { playlist_id: playlistId, user_id: userId },
    });
    if (!playlisLibrarytRecord) {
      return { success: false, reason: errorMessages.playlist.LibraryNotExistsById };
    }
    return { success: true, data: playlisLibrarytRecord };
  }
  async getLibrary(
    userId: string,
    sort: { sortBy: LibrarySortBy; order: Order },
    limit?: number,
    offset?: number,
  ): Promise<
    SuccessfulResult<{
      total: number;
      items: {
        date_added: string;
        date_played: string | null;
        playlists: Omit<IPlaylist, 'playlistId' | 'owner' | 'coverId'> & {
          placeholder_url_covers: string[] | null;
          id: string;
          owner: {
            id: string;
            visible_username: string;
          };
          cover_url: string | null;
        };
      }[];
    }>
  > {
    const order = (
      sort.sortBy === LibrarySortBy.Alphabetic
        ? [[{ model: database.playlistModel }, sort.sortBy, sort.order]]
        : [[sort.sortBy, sort.order]]
    ) as sequelize.Order;
    const playlistRecords = (await database.libraryPlaylists.findAndCountAll({
      where: { user_id: userId },
      raw: true,
      nest: true,
      order,
      include: [
        {
          model: database.playlistModel,
          // associationType:
          attributes: ['id', 'cover_id', 'name', 'owner', 'description', 'type'],

          // required: true,
          // required: true,
          // right: true,
          // through: { attributes: ['playlist_id'] },
          include: [
            {
              model: database.userModel,
              // required: true,
              // right: true,
              attributes: ['id', 'visible_username'],
            },
          ],
        },
      ],
      offset,
      limit,
    })) as unknown as {
      rows: {
        playlist_id: string;
        user_id: string;
        date_played: string | null;
        date_added: string;
        order: number;
        playlists: PlaylistModel['dataValues'] & {
          user: { id: string; visible_username: string };
        };
      }[];
      count: number;
    };
    const processedPlaylistRecords = await Promise.all(
      playlistRecords.rows.map(async (playlistLibraryRecord) => {
        let placeholderUrlCovers: string[] = [];
        const playlistTracks = await this.getAllTracksFromPlaylist(
          {
            playlistId: playlistLibraryRecord.playlist_id,
            userId: playlistLibraryRecord.user_id,
            sort: { sortBy: PlaylistSortBy.Date, order: Order.Asc },
          },
          4,
          0,
        );
        playlistTracks.data.items.forEach((playlistTrack) => {
          if (playlistTrack.cover_url === null) {
            return;
          }

          if (placeholderUrlCovers.includes(playlistTrack.cover_url)) {
            placeholderUrlCovers = [placeholderUrlCovers[0]];
            return;
          }
          placeholderUrlCovers.push(playlistTrack.cover_url);
        });
        if (placeholderUrlCovers.length !== 4 && placeholderUrlCovers.length > 0) {
          placeholderUrlCovers = [placeholderUrlCovers[0]];
        }

        return {
          ..._.omit(playlistLibraryRecord, ['user', 'playlist_id', 'user_id', 'order']),
          date_played: playlistLibraryRecord.date_played,
          date_added: playlistLibraryRecord.date_added,
          playlists: {
            ..._.omit(playlistLibraryRecord.playlists, ['cover_id', 'owner', 'user']),
            placeholder_url_covers: placeholderUrlCovers.length === 0 ? null : placeholderUrlCovers,
            owner: {
              id: playlistLibraryRecord.playlists.user.id,
              visible_username: playlistLibraryRecord.playlists.user.visible_username,
            },
            cover_url: playlistLibraryRecord.playlists.cover_id
              ? `${STATIC_IMAGES_PATH}/${playlistLibraryRecord.playlists.cover_id}.jpg`
              : null,
          },
        };
      }),
    );
    return {
      success: true,
      data: { total: playlistRecords.count, items: processedPlaylistRecords },
    };
  }
  async createLibraryRecord(userId: string, playlistId: string, transaction: Transaction) {
    const maxOrder = await database.libraryPlaylists.max('order', {
      where: {
        user_id: userId,
        [Op.and]: [
          sequelize.where(
            sequelize.fn('MOD', sequelize.col('order'), String(ORDER_NUMBER)),
            '=',
            '0',
          ),
        ],
      },
      transaction,
    });
    await database.libraryPlaylists.create(
      {
        playlist_id: playlistId,
        user_id: userId,
        order: typeof maxOrder === 'number' ? maxOrder + ORDER_NUMBER : ORDER_NUMBER,
      },
      { transaction },
    );
  }
  async deleteLibraryRecord(userId: string, playlistId: string, transaction: Transaction) {
    const playlistRecord = await this.getPlaylistRecordById(playlistId, userId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    await playlistRecord.data.destroy({ transaction });
    return { success: true, data: null };
  }

  async getLibraryPlaylistByIndex(
    userId: string,
    index: number,
  ): Promise<SuccessfulResult<LibraryPlaylistsModel | null>> {
    const LibraryPlaylistRecord = await database.libraryPlaylists.findOne({
      where: { user_id: userId },
      order: [['order', 'ASC']],
      offset: index,
    });

    if (LibraryPlaylistRecord === null) {
      return { success: true, data: LibraryPlaylistRecord };
    }
    return { success: true, data: LibraryPlaylistRecord };
  }
  async reorderLibrary(libraryInfo: IReorder) {
    const playlistRecord = await this.getLibraryPlaylistRecord(
      libraryInfo.playlistId,
      libraryInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (libraryInfo.fromIndex === libraryInfo.toIndex) {
      return { success: true, data: null };
    }
    const fromIndexRecord = await this.getLibraryPlaylistByIndex(
      libraryInfo.userId,
      libraryInfo.fromIndex,
    );
    if (!fromIndexRecord.data) {
      return { success: false, reason: errorMessages.playlist.LibraryNotExistsByIndex };
    }
    let toIndexPlaylistRecord;
    let afterPlaylistRecord;
    if (libraryInfo.toIndex > 0) {
      toIndexPlaylistRecord = await this.getLibraryPlaylistByIndex(
        libraryInfo.userId,
        libraryInfo.toIndex,
      );
      if (!toIndexPlaylistRecord.data) {
        return { success: false, reason: errorMessages.playlist.LibraryNotExistsByIndex };
      }
      afterPlaylistRecord = await database.libraryPlaylists.findOne({
        where: {
          user_id: libraryInfo.userId,
          order: { [Op.gt]: toIndexPlaylistRecord.data.order },
        },
        /////
        order: [['order', 'ASC']],
        /////
      });
    }
    let newOrder;
    if (toIndexPlaylistRecord || afterPlaylistRecord) {
      newOrder = Math.floor(
        ((toIndexPlaylistRecord?.data?.order ?? 0) + (afterPlaylistRecord?.order ?? 0)) / 2,
      );
    }
    if (libraryInfo.toIndex === 0) {
      newOrder = Math.floor((toIndexPlaylistRecord?.data?.order ?? 0) / 2);
    }
    if (afterPlaylistRecord === null || libraryInfo.toIndex === -1) {
      const maxOrder = await database.libraryPlaylists.max('order', {
        where: {
          [Op.and]: {
            user_id: libraryInfo.userId,
            [Op.and]: [
              sequelize.where(
                sequelize.fn('MOD', sequelize.col('order'), String(ORDER_NUMBER)),
                '=',
                '0',
              ),
            ],
          },
        },
      });
      newOrder = typeof maxOrder === 'number' ? maxOrder + ORDER_NUMBER : 0;
    }
    const collision = await database.libraryPlaylists.findOne({
      where: {
        user_id: libraryInfo.userId,
        order: newOrder,
      },
    });
    if (collision) {
      // console.log(collision);
      await this.renormalizeLibraryOrder(libraryInfo.userId);
      await this.reorderLibrary(libraryInfo);
      return { success: true, data: null };
    }
    await database.libraryPlaylists.update(
      { order: newOrder },
      { where: { order: fromIndexRecord.data.order } },
    );
    return { success: true, data: null };
  }
  async renormalizeLibraryOrder(userId: string) {
    try {
      await database.sequelize.transaction(async (transaction) => {
        const rows = await database.libraryPlaylists.findAll({
          where: { user_id: userId },
          order: [['order', 'ASC']],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        const updates = rows.map((row, orderMultiplier) => ({
          user_id: userId,
          playlist_id: row.playlist_id,
          order: (orderMultiplier + 1) * ORDER_NUMBER,
        }));

        await database.libraryPlaylists.bulkCreate(updates, {
          updateOnDuplicate: ['order'],
          transaction,
        });
      });
    } catch {
      throw new InternalError(`failed to renormalize ${userId} Library order`);
    }
  }

  async getPlaylistTrackByIndex(
    playlistId: string,
    index: number,
  ): Promise<SuccessfulResult<PlaylistTrackModel | null>> {
    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      where: { playlist_id: playlistId },
      order: [['order', 'ASC']],
      offset: index,
    });
    if (playlistTrackRecord === null) {
      return { success: true, data: playlistTrackRecord };
    }

    return { success: true, data: playlistTrackRecord };
  }
  async reorderPlaylistTrack(playlistInfo: IReorder) {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistInfo.fromIndex === playlistInfo.toIndex) {
      return { success: true, data: null };
    }
    const fromIndexRecord = await this.getPlaylistTrackByIndex(
      playlistInfo.playlistId,
      playlistInfo.fromIndex,
    );
    if (!fromIndexRecord.data) {
      return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
    }
    let toIndexPlaylistRecord;
    let afterPlaylistTrackRecord;
    if (playlistInfo.toIndex > 0) {
      toIndexPlaylistRecord = await this.getPlaylistTrackByIndex(
        playlistInfo.playlistId,
        playlistInfo.toIndex,
      );
      if (!toIndexPlaylistRecord.data) {
        return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
      }
      afterPlaylistTrackRecord = await database.playlistTrackModel.findOne({
        where: {
          playlist_id: playlistInfo.playlistId,
          order: { [Op.gt]: toIndexPlaylistRecord.data.order },
        },
        order: [['order', 'ASC']],
        offset: 0,
      });
    }

    let newOrder;
    if (toIndexPlaylistRecord || afterPlaylistTrackRecord) {
      newOrder = Math.floor(
        ((toIndexPlaylistRecord?.data?.order ?? 0) + (afterPlaylistTrackRecord?.order ?? 0)) / 2,
      );
    }
    if (playlistInfo.toIndex === 0) {
      newOrder = Math.floor((toIndexPlaylistRecord?.data?.order ?? 0) / 2);
    }
    if (afterPlaylistTrackRecord === null || playlistInfo.toIndex === -1) {
      const maxOrder = await database.playlistTrackModel.max('order', {
        where: {
          [Op.and]: {
            playlist_id: playlistInfo.playlistId,
            [Op.and]: [
              sequelize.where(
                sequelize.fn('MOD', sequelize.col('order'), String(ORDER_NUMBER)),
                '=',
                '0',
              ),
            ],
          },
        },
      });
      newOrder = typeof maxOrder === 'number' ? maxOrder + ORDER_NUMBER : 0;
    }

    const collision = await database.playlistTrackModel.findOne({
      where: {
        playlist_id: playlistInfo.playlistId,
        order: newOrder,
      },
    });

    if (collision) {
      await this.renormalizePlaylistOrder(playlistInfo.playlistId);
      await this.reorderLibrary(playlistInfo);
      return { success: true, data: null };
    }
    await database.playlistTrackModel.update(
      { order: newOrder },
      { where: { order: fromIndexRecord.data.order } },
    );
    return { success: true, data: null };
  }
  async renormalizePlaylistOrder(playlistId: IPlaylist['playlistId']) {
    try {
      await database.sequelize.transaction(async (transaction) => {
        const rows = await database.playlistTrackModel.findAll({
          where: { playlist_id: playlistId },
          order: [['order', 'ASC']],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        const updates = rows.map((row, orderMultiplier) => ({
          playlist_id: playlistId,
          track_id: row.track_id,
          order: (orderMultiplier + 1) * ORDER_NUMBER,
          id: row.id,
        }));

        await database.playlistTrackModel.bulkCreate(updates, {
          updateOnDuplicate: ['order', 'id'],
          transaction,
        });
      });
    } catch {
      throw new InternalError(`failed to renormalize Playlist ${playlistId} order`);
    }
  }
}
// -getAllTracksFromPlaylist-, -getPlaylistsByName-, -removeTrackFromPlaylist-, -updateRestrictions-, updatecover, -updatePlaylistInfo-, -reorderPlaylistTrack, getMeLibrary(getMeplaylists and followed playlists. sort by smth)-,
//-getPlaylistInfo(sum duration, IsOwner(to see if able to follow playlist or not))-
// createLikedSongs, likeTrack, getAllLikedSongs(pagination, sort), reorder, removeFromLikedSongs
// depend getPlaylistRecordById from auth(restrictions unlisted), getPlaylistsByName only public or owner of which is user,
// updatePlaylistInfo and updateRestrictions only if user is an owner, removeTrackFromPlaylist and addTrackToPlaylist only if user is an owner
// getnextTrack(playlist,search,likedSongs,Likedsongs from artist. )
//playlist type. Liked; general
export default PlaylistManager;

// artist profiles. top songs, all
