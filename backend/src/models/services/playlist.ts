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
import { LibrarySortBy, LibraryType } from '../../interfaces/library-interface.ts';
import {
  Type,
  Restrictions,
  PlaylistSortBy,
  OrderBy,
} from '../../interfaces/playlist-interface.ts';

import type {
  AlbumSpecificSortBy,
  PlaylistAlbumInstanceWithRelations,
} from '../../interfaces/album-interface.ts';
import type {
  ICreatePlaylist,
  IPlaylist,
  IReorder,
  IUpdatePlaylist,
} from '../../interfaces/playlist-interface.ts';
import type { ITrack } from '../../interfaces/track-interface.ts';
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
    playlists?: PlaylistModel[];
  };
};

type DeleteAlbumErrors =
  | typeof errorMessages.playlist.NotExistsById
  | typeof errorMessages.liked.CantDelete
  | typeof errorMessages.album.NotExistsById
  | typeof errorMessages.album.playlistAlbumRecordNotExists;

class PlaylistManager {
  async createPlaylist(
    playlistInfo: ICreatePlaylist &
      Pick<IPlaylist, 'restrictions'> & { coverId?: string | null; transaction?: Transaction },
  ): Promise<SuccessfulResult<{ playlistId: string; userId: string }>> {
    let playlistRecord: Partial<PlaylistModel> = {};
    try {
      await database.sequelize.transaction(async (transaction) => {
        const playlistCount = await database.playlistModel.count({
          where: { owner: playlistInfo.owner, type: Type.General },
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
          { transaction: playlistInfo.transaction ?? transaction },
        );
        await this.createLibraryRecord(
          localPlaylistRecord.owner,
          localPlaylistRecord.id,
          playlistInfo.transaction ?? transaction,
        );
        playlistRecord = localPlaylistRecord;
      });
    } catch {
      throw new InternalError(errorMessages.playlist.FailedToCreate);
    }
    return {
      success: true,
      data: { playlistId: playlistRecord.id ?? '', userId: playlistRecord.owner ?? '' },
    };
  }
  async createPlaylistAlbum(albumInfo: {
    playlistId: string;
    userId: string;
    transaction: Transaction;
  }): Promise<SuccessfulResult<null>> {
    await database.playlistAlbumsModel.create(
      {
        playlist_id: albumInfo.playlistId,
        date_released: null,
      },
      { transaction: albumInfo.transaction },
    );
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
      throw new InternalError(errorMessages.playlist.FailedToDelete);
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
      throw new InternalError(errorMessages.album.FailedToDelete);
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
  ): Promise<Result<PlaylistTrackModel, typeof errorMessages.playlist.PlaylistTrackNotExistsByID>> {
    const playlistTrackRecord = await database.playlistTrackModel.findByPk(playlistTrackId);
    if (!playlistTrackRecord) {
      return { success: false, reason: errorMessages.playlist.PlaylistTrackNotExistsByID };
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
            user_id: playlistTrackInfo.userId,
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
            user_id: playlistTrackInfo.userId,
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
      throw new InternalError(errorMessages.playlist.FailedToAddTrack);
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

  async getAllTracksFromPlaylist(
    playlistInfo: {
      playlistId: string;
      userId: string;
      sort: { sortBy: PlaylistSortBy | AlbumSpecificSortBy; order: OrderBy };
      type?: Type;
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    SuccessfulResult<{
      items: (Pick<ITrack, 'deleted' | 'name' | 'duration'> & {
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
              model: database.playlistModel,
              where: { id: playlistInfo.userId },
              through: { attributes: ['id', 'date_added'] },
              required: false,
            },
            {
              association: 'album',
              required: false,
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
          deleted: row.track.deleted,
          name: row.track.name,
          duration: row.track.duration,
          lyrics: row.track.lyrics,
          cover_url: row.track.cover_id ? `${STATIC_IMAGES_PATH}/${row.track.cover_id}.jpg` : null,
          album: row.track.album ?? { id: row.track.id, name: row.track.name },
          id: row.track_id,
          is_liked: Boolean(row.track.playlists?.length),
          date_added: row.date_added ?? null,
          artists: row.track.users,
        };
        if (playlistInfo.type === Type.Liked) {
          return {
            ...basePlaylistRow,
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
      sort: { sortBy: PlaylistSortBy; order: OrderBy };
      isLiked?: boolean;
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    SuccessfulResult<{
      items: (Pick<ITrack, 'deleted' | 'name' | 'duration'> & {
        id: string;
        playlist_track_id: string;
        date_added: Date | null;
        cover_url: string | null;
        artists: { id: string; visible_username: string }[];
        is_liked?: boolean;
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
            {
              model: database.playlistModel,
              where: { id: searchInfo.userId },
              through: { attributes: ['id', 'date_added'] },
              required: false,
            },
            { association: 'album', required: false },
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
            creation_date: row.track.creation_date,
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
            album: row.track.album ?? { id: row.track.id, name: row.track.name },
            is_liked: Boolean(row.track.playlists?.length),
            creation_date: row.track.creation_date,
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
    const processedPlaylistRecords = await Promise.all(
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
            sort: { sortBy: PlaylistSortBy.Date, order: OrderBy.Asc },
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
      data: { total: playlistsRecords.count, items: processedPlaylistRecords },
    };
  }
  async getAlbumsByOwner(
    userId: string,
    sort: { sortBy: AlbumsSortBy; order: OrderBy },
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
      return {
        id: albumRecord.id,
        name: albumRecord.name,
        published: !!albumRecord.playlist_album.date_released,
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
  async searchForAlbums(
    searchInfo: { userId: string; searchString: string },
    offset = 0,
    limit = 9,
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
    const searchPattern = `%${searchInfo.searchString}%`;
    const playlistRecords = (await database.playlistModel.scope('albumOnly').findAndCountAll({
      attributes: [
        'id',
        'cover_id',
        'name',
        'owner',
        [
          database.sequelize.literal(`
        (
          SELECT ARRAY(
            SELECT DISTINCT u.visible_username
            FROM playlist_tracks pt
            JOIN tracks t ON t.id = pt.track_id
            JOIN track_artists ta ON ta.track_id = t.id
            JOIN users u ON u.id = ta.artist_id
            WHERE pt.playlist_id = playlist.id
            LIMIT 3
          )
        )
      `),
          'artists_usernames',
        ],
      ],
      where: {
        name: {
          [Op.iLike]: searchPattern,
        },
        [Op.or]: { restrictions: Restrictions.Public, owner: searchInfo.userId },
      },
      include: [
        {
          model: database.playlistAlbumsModel,
          attributes: ['date_released'],
        },
      ],
      offset,
      limit,
    })) as {
      rows: (PlaylistModel & {
        playlist_album: PlaylistAlbumsModel;
        artists_usernames: string[];
      })[];
      count: number;
    };
    const processedPlaylistRecords = playlistRecords.rows.map((albumRecord) => {
      return {
        id: albumRecord.id,
        name: albumRecord.name,
        published: !!albumRecord.playlist_album.date_released,
        date_released: albumRecord.playlist_album.date_released,
        artists_usernames: albumRecord.artists_usernames,
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
          { date_released: albumInfo.releaseDate ?? sequelize.fn('NOW') },
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
  async updatePlaylistPlayDate(
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
  async updateAlbumPlayDate(
    userId: string,
    albumId: string,
  ): Promise<
    Result<
      null,
      typeof errorMessages.album.NotExistsById | typeof errorMessages.album.AlbumIsNotAnAlbum
    >
  > {
    const playlistRecord = await this.getAlbumRecordById(albumId, userId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    await database.libraryReleasesModel.update(
      { date_played: sequelize.fn('NOW') },
      { where: { user_id: userId, album_id: albumId } },
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
    const playlistLibraryRecord = await database.libraryPlaylists.findOne({
      where: { playlist_id: playlistId, user_id: userId },
    });
    if (!playlistLibraryRecord) {
      return { success: false, reason: errorMessages.playlist.LibraryNotExistsById };
    }
    return { success: true, data: playlistLibraryRecord };
  }
  async getPlaylistLibrary(
    libraryInfo: {
      userId: string;
      extended: boolean;
      sort: { sortBy: LibrarySortBy; order: OrderBy };
    },
    limit?: number,
    offset?: number,
  ): Promise<
    SuccessfulResult<{
      total: number;
      items: (Pick<IPlaylist, 'name'> & {
        id: string;
        owner?: {
          id: string;
          visible_username: string;
        };
        cover_url: string | null;
        library_type?: LibraryType;
      })[];
    }>
  > {
    const order = (
      libraryInfo.sort.sortBy === LibrarySortBy.Alphabetic
        ? [[{ model: database.playlistModel }, libraryInfo.sort.sortBy, libraryInfo.sort.order]]
        : [[libraryInfo.sort.sortBy, libraryInfo.sort.order]]
    ) as sequelize.Order;
    const playlistAttributes: sequelize.FindAttributeOptions = ['id', 'cover_id', 'name', 'owner'];
    if (libraryInfo.extended) {
      playlistAttributes.push([
        database.sequelize.literal(`
              (
                SELECT ARRAY(
                  SELECT DISTINCT u.visible_username
                  FROM playlist_tracks pt
                  JOIN tracks t ON t.id = pt.track_id
                  JOIN track_artists ta ON ta.track_id = t.id
                  JOIN users u ON u.id = ta.artist_id
                  WHERE pt.playlist_id = playlist.id
                  LIMIT 3
                )
              )
            `),
        'artists_usernames',
      ]);
    }
    const playlistRecords = (await database.libraryPlaylists.findAll({
      where: { user_id: libraryInfo.userId },
      subQuery: false,
      order,
      include: [
        {
          model: database.playlistModel,
          attributes: playlistAttributes,
          where: { type: Type.General },
          required: true,
          include: [
            {
              model: database.userModel,
              attributes: ['id', 'visible_username'],
            },
          ],
        },
      ],
      offset,
      limit,
    })) as unknown as {
      id: string;
      playlist_id: string;
      user_id: string;
      date_played: string | null;
      date_added: string;
      order: number;
      playlist: PlaylistModel & {
        user: { id: string; visible_username: string };
        dataValues: PlaylistModel['dataValues'] & {
          artists_usernames?: string[];
        };
      };
    }[];
    const playlistCount = await database.libraryPlaylists.count({
      where: { user_id: libraryInfo.userId },
    });
    const processedPlaylistRecords = playlistRecords.map((playlistLibraryRecord) => {
      const processedRecord = {
        ..._.pick(playlistLibraryRecord.playlist, ['name', 'id']),
        owner: {
          id: playlistLibraryRecord.playlist.user.id,
          visible_username: playlistLibraryRecord.playlist.user.visible_username,
        },
        cover_url: playlistLibraryRecord.playlist.cover_id
          ? `${STATIC_IMAGES_PATH}/${playlistLibraryRecord.playlist.cover_id}.jpg`
          : null,
      };
      if (libraryInfo.extended) {
        return {
          ...processedRecord,
          count: playlistLibraryRecord.playlist.dataValues.tracks_count,
          artists_usernames: playlistLibraryRecord.playlist.dataValues.artists_usernames,
        };
      }
      return processedRecord;
    });
    return {
      success: true,
      data: { total: playlistCount, items: processedPlaylistRecords },
    };
  }
  async getAlbumLibrary(
    libraryInfo: {
      userId: string;
      extended: boolean;
      sort: { sortBy: LibrarySortBy; order: OrderBy };
    },
    limit?: number,
    offset?: number,
  ): Promise<
    SuccessfulResult<{
      total: number;
      items: (Pick<IPlaylist, 'name'> & {
        id: string;
        owner?: {
          id: string;
          visible_username: string;
        };
        cover_url: string | null;
        library_type: LibraryType.Albums;
      })[];
    }>
  > {
    const order = (
      libraryInfo.sort.sortBy === LibrarySortBy.Alphabetic
        ? [[{ model: database.playlistModel }, libraryInfo.sort.sortBy, libraryInfo.sort.order]]
        : [[libraryInfo.sort.sortBy, libraryInfo.sort.order]]
    ) as sequelize.Order;

    const playlistRecords = (await database.libraryReleasesModel.findAll({
      // // 'distinct_artist',

      where: { user_id: libraryInfo.userId, album_id: { [Op.not]: 'null' } },
      // raw: true,
      // nest: true,
      // distinct: true,
      order,
      // group: 'playlists.tracks.users.track_artists.artist_id',
      include: [
        {
          model: database.playlistModel,
          // associationType:
          attributes: ['id', 'cover_id', 'name', 'owner'],

          where: { type: Type.Album },
          required: true,
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
      id: string;
      playlist_id: string;
      track_id: null;
      user_id: string;
      date_played: string | null;
      date_added: string;
      order: number;
      playlists: PlaylistModel &
        {
          user: { id: string; visible_username: string };
        }[];
    }[];
    const playlistCount = await database.libraryPlaylists.count({
      where: { user_id: libraryInfo.userId },
    });
    const processedPlaylistRecords = playlistRecords.map((playlistLibraryRecord) => {
      const processedRecord = {
        ..._.pick(playlistLibraryRecord.playlists, ['name', 'id']),
        cover_url: playlistLibraryRecord.playlists.cover_id
          ? `${STATIC_IMAGES_PATH}/${playlistLibraryRecord.playlists.cover_id}.jpg`
          : null,
        library_type: LibraryType.Albums as LibraryType.Albums,
      };
      if (libraryInfo.extended) {
        return {
          ...processedRecord,
          owner: {
            id: playlistLibraryRecord.playlists[0].user.id,
            visible_username: playlistLibraryRecord.playlists[0].user.visible_username,
          },
        };
      }
      return processedRecord;
    });
    return {
      success: true,
      data: { total: playlistCount, items: processedPlaylistRecords },
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
        id: crypto.randomUUID(),
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
    await database.libraryPlaylists.destroy({
      where: { playlist_id: playlistId, user_id: userId },
      transaction,
    });
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
      { where: { user_id: libraryInfo.userId, order: fromIndexRecord.data.order } },
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
          id: row.id,
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
    userId: string,
    search?: string,
  ): Promise<SuccessfulResult<PlaylistTrackModel | null>> {
    let whereClause: sequelize.WhereOptions = {
      playlist_id: playlistId,
      user_id: userId,
    };
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { '$track.name$': { [Op.iLike]: `%${search}%` } },
          { '$track.lyrics$': { [Op.iLike]: `%${search}%` } },
          sequelize.literal(`
          EXISTS (
            SELECT 1
            FROM "track_artists" ta
            JOIN "users" u ON u.id = ta.artist_id
            WHERE ta.track_id = "track"."id"
            AND u.visible_username ILIKE ${database.sequelize.escape(`%${search}%`)}
            )
            `),
        ],
      };
    }
    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      where: whereClause,
      order: [['order', 'ASC']],
      offset: index,
    });
    if (playlistTrackRecord === null) {
      return { success: true, data: playlistTrackRecord };
    }

    return { success: true, data: playlistTrackRecord };
  }
  async getRandomPlaylistTrackByIndex(playlistTrackInfo: {
    playlistId: string;
    currentTrackId: string;
    index: number;
    userId: string;
    search?: string;
  }): Promise<
    Result<
      PlaylistTrackModel | { track_id: string; id: string },
      typeof errorMessages.playlist.TrackNotExistsByIndex
    >
  > {
    const currentTrack = await this.getPlaylistTrackByIndex(
      playlistTrackInfo.playlistId,
      playlistTrackInfo.index,
      playlistTrackInfo.userId,
    );
    if (!currentTrack.data) {
      return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
    }
    let whereClause: sequelize.WhereOptions = {
      playlist_id: playlistTrackInfo.playlistId,
      user_id: playlistTrackInfo.userId,
      track_id: { [Op.ne]: playlistTrackInfo.currentTrackId },
    };
    if (playlistTrackInfo.search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { '$track.name$': { [Op.iLike]: `%${playlistTrackInfo.search}%` } },
          { '$track.lyrics$': { [Op.iLike]: `%${playlistTrackInfo.search}%` } },
          sequelize.literal(`
          EXISTS (
            SELECT 1
            FROM "track_artists" ta
            JOIN "users" u ON u.id = ta.artist_id
            WHERE ta.track_id = "track"."id"
            AND u.visible_username ILIKE ${database.sequelize.escape(`%${playlistTrackInfo.search}%`)}
            )
            `),
        ],
      };
    }
    const playlistTrackCount = await database.playlistTrackModel.count({
      where: whereClause,
    });

    // eslint-disable-next-line sonarjs/pseudo-random
    const randomOffset = Math.floor(Math.random() * playlistTrackCount);

    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      where: whereClause,
      offset: randomOffset,
    });
    if (playlistTrackRecord === null) {
      return {
        success: true,
        data: { track_id: playlistTrackInfo.currentTrackId, id: currentTrack.data.id },
      };
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
      playlistInfo.userId,
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
        playlistInfo.userId,
      );
      if (!toIndexPlaylistRecord.data) {
        return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
      }
      afterPlaylistTrackRecord = await database.playlistTrackModel.findOne({
        where: {
          playlist_id: playlistInfo.playlistId,
          user_id: playlistInfo.userId,
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
          user_id: playlistInfo.userId,
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
        user_id: playlistInfo.userId,
        playlist_id: playlistInfo.playlistId,
        order: newOrder,
      },
    });

    if (collision) {
      await this.renormalizePlaylistOrder(playlistInfo.playlistId, playlistInfo.userId);
      await this.reorderLibrary(playlistInfo);
      return { success: true, data: null };
    }
    await database.playlistTrackModel.update(
      { order: newOrder },
      { where: { user_id: playlistInfo.userId, order: fromIndexRecord.data.order } },
    );
    return { success: true, data: null };
  }
  async renormalizePlaylistOrder(playlistId: IPlaylist['playlistId'], userId: string) {
    try {
      await database.sequelize.transaction(async (transaction) => {
        const rows = await database.playlistTrackModel.findAll({
          where: { playlist_id: playlistId, user_id: userId },
          order: [['order', 'ASC']],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        const updates = rows.map((row, orderMultiplier) => ({
          playlist_id: playlistId,
          user_id: row.user_id,
          track_id: row.track_id,
          order: (orderMultiplier + 1) * ORDER_NUMBER,
          id: row.id,
        }));

        await database.playlistTrackModel.bulkCreate(updates, {
          updateOnDuplicate: ['order'],
          transaction,
        });
      });
    } catch {
      throw new InternalError(`failed to renormalize Playlist ${playlistId} order`);
    }
  }
  async createLibraryReleases(userId: string, playlist_id: string) {
    const maxOrder = await database.libraryReleasesModel.max('order', {
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
    });
    await database.libraryReleasesModel.create({
      id: crypto.randomUUID(),
      track_id: null,
      user_id: userId,
      album_id: playlist_id,
      order: typeof maxOrder === 'number' ? maxOrder + ORDER_NUMBER : ORDER_NUMBER,
    });
  }

  async followAlbum(
    userId: string,
    playlistId: string,
  ): Promise<
    Result<
      null,
      | typeof errorMessages.album.NotExistsById
      | typeof errorMessages.album.AlbumIsNotAnAlbum
      | typeof errorMessages.playlist.AlreadyFollowsAlbum
      | typeof errorMessages.user.CanNotFollowYourAlbum
    >
  > {
    const albumRecord = await this.getAlbumRecordById(playlistId, userId);
    if (!albumRecord.success) {
      return albumRecord;
    }
    const libraryAlbumRecord = await database.libraryReleasesModel.findOne({
      where: { user_id: userId, album_id: playlistId },
    });
    if (libraryAlbumRecord) {
      return { success: false, reason: errorMessages.playlist.AlreadyFollowsAlbum };
    }
    const playlistLibraryRecord = await database.libraryPlaylists.findOne({
      where: { user_id: userId, playlist_id: playlistId },
    });
    if (playlistLibraryRecord) {
      return { success: false, reason: errorMessages.user.CanNotFollowYourAlbum };
    }
    await this.createLibraryReleases(userId, playlistId);
    // console.log(singleId);

    return { success: true, data: null };
  }
  async unfollowAlbum(
    userId: string,
    playlistId: string,
  ): Promise<
    Result<
      null,
      | typeof errorMessages.album.NotExistsById
      | typeof errorMessages.album.AlbumIsNotAnAlbum
      | typeof errorMessages.playlist.NotFollowsAlbum
    >
  > {
    const albumRecord = await this.getAlbumRecordById(playlistId, userId);
    if (!albumRecord.success) {
      return albumRecord;
    }
    const libraryAlbumRecord = await database.libraryReleasesModel.findOne({
      where: { user_id: userId, album_id: playlistId },
    });
    if (!libraryAlbumRecord) {
      return { success: false, reason: errorMessages.playlist.NotFollowsAlbum };
    }

    await libraryAlbumRecord.destroy();

    return { success: true, data: null };
  }
}

export default PlaylistManager;
