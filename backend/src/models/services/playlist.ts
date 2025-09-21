import crypto from 'node:crypto';

import sequelize, { Op } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';
import { Type, Restrictions } from '../../interfaces/playlist-interface.ts';

import type {
  ICreatePlaylist,
  IPlaylist,
  IUpdateTrack,
} from '../../interfaces/playlist-interface.ts';

class PlaylistManager {
  async createPlaylist(playlistInfo: ICreatePlaylist) {
    const playlistRecord = await database.playlistModel.create({
      id: crypto.randomUUID(),
      name: playlistInfo.name,
      description: playlistInfo.description ?? null,
      cover_id: playlistInfo.cover_id ?? null,
      owner: playlistInfo.owner,
      restrictions: playlistInfo.restrictions,
      type: Type.General,
    });

    return { success: true, data: playlistRecord };
  }
  async getPlaylistById(playlistId: string) {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    if (!playlistRecord) {
      return { success: false, reason: errorMessages.playlist.NotExistsById };
    }
    return { success: true, data: playlistRecord };
  }
  async addTrackToPlaylist(playlistTrackInfo: {
    playlistId: string;
    trackId: string;
    userId: string;
  }) {
    const playlistRecord = await this.getPlaylistById(playlistTrackInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistTrackInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }

    let newPlaylistRecord;
    try {
      await database.sequelize.transaction(async (transaction) => {
        newPlaylistRecord = await database.playlistTrackModel.create(
          {
            playlist_id: playlistTrackInfo.playlistId,
            track_id: playlistTrackInfo.trackId,
          },
          { transaction: transaction },
        );
        await database.playlistModel.update(
          { tracks_count: playlistRecord.data.tracks_count + 1 },
          { where: { id: playlistRecord.data.id }, transaction: transaction },
        );
      });
    } catch {
      throw new InternalError('failed to add track');
    }
    return { success: true, data: newPlaylistRecord };
  }
  async removeTrackFromPlaylist(playlistTrackInfo: {
    playlistId: string;
    trackId: string;
    userId: string;
  }) {
    const playlistRecord = await this.getPlaylistById(playlistTrackInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistTrackInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }

    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      where: {
        playlist_id: playlistTrackInfo.playlistId,
        track_id: playlistTrackInfo.trackId,
      },
    });
    if (!playlistTrackRecord) {
      return { success: false, reason: errorMessages.playlist.TrackNotBelongs };
    }

    try {
      await database.sequelize.transaction(async (transaction) => {
        await playlistTrackRecord.destroy({ transaction: transaction });

        await database.playlistModel.update(
          { tracks_count: playlistRecord.data.tracks_count - 1 },
          { where: { id: playlistRecord.data.id }, transaction: transaction },
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
      sort: { sortBy: string; order: string };
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const playlistRecord = await this.getPlaylistById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    const playlistTracks = await database.playlistModel.findAndCountAll({
      where: { id: playlistInfo.playlistId, '$track.deleted$': { [Op.ne]: 'deleted' } },
      attributes: [[sequelize.col('user.visible_username'), 'artist_name']],
      order: [[playlistInfo.sort.sortBy ?? 'order', playlistInfo.sort.order ?? 'ASC']],
      include: [
        {
          //I can bet my tooth that it doesn't fucking work
          //also through and attributes are fucking shit
          model: database.trackModel,
          attributes: ['delete', 'name', 'duration'],
          include: { model: database.trackArtistsModel, attributes: ['artist_id'] },
        },
        //trackArtists and user probably will need to go to other query
        {
          model: database.trackArtistsModel,
          attributes: ['artist_id'],
        },
        {
          model: database.userModel,
          attributes: ['visible_username'],
          through: { attributes: ['artist_id'] },
        },
      ],
      offset,
      limit,
    });

    return { success: true, data: { rows: playlistTracks.rows, count: playlistTracks.count } };
  }
  async getPlaylistsByName(
    playlistInfo: Pick<IPlaylist, 'name'> & { userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const playlistsRecords = await database.playlistModel.findAndCountAll({
      where: {
        name: { [Op.iLike]: `%${playlistInfo.name}%` },
        [Op.or]: { restrictions: Restrictions.public, owner: playlistInfo.userId },
      },
      order: [[sequelize.literal(`owner = '${playlistInfo.userId}'`), 'DESC']],
      offset,
      limit,
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //check how order works
    return { success: true, data: playlistsRecords };
  }

  async updateRestrictionsById(
    playlistInfo: Pick<IPlaylist, 'playlistId' | 'restrictions'> & { userId: string },
  ) {
    const playlistRecord = await this.getPlaylistById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }

    const updatedPlaylistRecord = await playlistRecord.data.update({
      restrictions: playlistInfo.restrictions,
    });

    return { success: true, data: updatedPlaylistRecord };
  }
  async updatePlaylistInfo(playlistInfo: IUpdateTrack & { userId: string }) {
    const playlistRecord = await this.getPlaylistById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
    const updatedPlaylistRecord = await playlistRecord.data.update({
      name: playlistInfo.name ?? playlistRecord.data.name,
      description: playlistInfo.description ?? playlistRecord.data.description,
    });

    return { success: true, data: updatedPlaylistRecord };
  }
  async getPlaylistInfo(playlistInfo: { playlistId: string; userId: string }) {
    const playlistRecord = await this.getPlaylistById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    const playlistAndTrackRecord = await database.playlistModel.findAll({
      where: { id: playlistInfo.playlistId },
      include: [
        {
          model: database.trackModel,
          attributes: ['duration'],
        },
      ],
    });
    const songsCount = await database.playlistTrackModel.count({
      where: { playlist_id: playlistInfo.playlistId },
    });
    let totalDuration = 0;
    // eslint-disable-next-line github/array-foreach, unicorn/no-array-for-each
    playlistAndTrackRecord.forEach((track) => {
      totalDuration += Number(track.duration);
    });

    const responseData = {
      name: playlistRecord.data.name,
      description: playlistRecord.data.description,
      totalDuration,
      owner: playlistRecord.data.owner,
      restrictions: playlistRecord.data.restrictions,
      songsCount,
      isOwner: playlistRecord.data.owner === playlistInfo.userId,
    };
    return { success: true, data: responseData };
  }
  async reorderPlaylistTrack(playlistTrackInfo: {
    playlistId: string;
    trackId: string;
    order: number;
  }) {
    const playlistRecord = await this.getPlaylistById(playlistTrackInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    await database.playlistTrackModel.update(
      { order: playlistTrackInfo.order },
      { where: { playlist_id: playlistTrackInfo.playlistId, track_id: playlistTrackInfo.trackId } },
    );
    return { success: true, data: null };
  }
}
// -getAllTracksFromPlaylist-, -getPlaylistsByName-, -removeTrackFromPlaylist-, -updateRestrictions-, updatecover, -updatePlaylistInfo-, -reorderPlaylistTrack, getMeLibrary(getMeplaylists and followed playlists. sort by smth)-,
//-getPlaylistInfo(sum duration, IsOwner(to see if able to follow playlist or not))-
// createLikedSongs, likeTrack, getAllLikedSongs(pagination, sort), reorder, removeFromLikedSongs
// depend getPlaylistById from auth(restrictions unlisted), getPlaylistsByName only public or owner of which is user,
// updatePlaylistInfo and updateRestrictions only if user is an owner, removeTrackFromPlaylist and addTrackToPlaylist only if user is an owner
// getnextTrack(playlist,search,likedSongs,Likedsongs from artist,)
//playlist type. Liked; general
export default PlaylistManager;
