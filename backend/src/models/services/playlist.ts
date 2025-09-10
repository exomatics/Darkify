import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';
import { IPlaylist } from '../../interfaces/playlist-interface.ts';

class PlaylistManager {
  async createPlaylist(playlistInfo: IPlaylist) {
    const playlistRecord = database.playlistModel.create({
      id: playlistInfo.id,
      name: playlistInfo.name,
      description: playlistInfo.description ?? null,
      cover_id: playlistInfo.cover_id ?? null,
      owner: playlistInfo.owner,
      restrictions: playlistInfo.restrictions,
    });

    return { success: true, data: playlistRecord };
  }
  async getPlaylistById(playlistId: Pick<IPlaylist, 'id'>['id']) {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    if (!playlistRecord) {
      return { success: false, reason: errorMessages.playlist.NotExistsById };
    }
    return { success: true, data: playlistRecord };
  }
  async addTrackToPlaylist(playlistTrackInfo: { playlistId: string; trackId: string }) {
    const playlistRecord = await this.getPlaylistById(playlistTrackInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
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
}
//getAllTracksFromPlaylist, getPlaylistsByName, removeTrackFromPlaylist, updateRestrictions, updatePlaylistInfo
//depend getPlaylistById from auth, getPlaylistsByName only public or owner of which is user,
// updatePlaylistInfo and updateRestrictions only if user is an owner, removeTrackFromPlaylist and addTrackToPlaylist only if user is an owner

export default PlaylistManager;
