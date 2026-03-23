import { errorMessages } from '../errors/error-messages.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { SongContext } from '../interfaces/next-song-interface.ts';
import ArtistManager from '../models/services/artist.ts';
import PlaylistManager from '../models/services/playlist.ts';
import TrackManager from '../models/services/track.ts';
import UserManager from '../models/services/user.ts';

import type { GetNextSong } from '../interfaces/next-song-interface.ts';
import type { TrackWithAlbum, TrackWithRelations } from '../interfaces/track-interface.ts';

const user = new UserManager();
const track = new TrackManager();
const artist = new ArtistManager();
const playlist = new PlaylistManager();
// {
// 	"context":
// 	| "playlist" // id is playlistId
// 	| "album-local" // id is albumId
// 	| "album-full-list" // id is albumId
// 	| "liked" // id is ""
// 	| "artist-top10" // id is artistId
// 	| "search-global" // depends on search
// 	| "search-songs" // depends on search
// 	| "other", // magic
// | "single", // if loop then loop or stop
// 	"id": "",
// 	"search"?: "search",
// 	"loop": boolean,
// 	"shuffle": boolean
// }
export default {
  async playlistOrAlbumNextSong(nextSongInfo: GetNextSong & { userId: string }) {
    if (
      nextSongInfo.context !== SongContext.Playlist &&
      nextSongInfo.context !== SongContext.Album &&
      nextSongInfo.context !== SongContext.Liked
    ) {
      throw new ValidationError('wrong context');
    }

    const playlistId = nextSongInfo.id ?? nextSongInfo.userId;

    const isTrackExists = await playlist.getPlaylistTrackByIndex(
      playlistId,
      nextSongInfo.index,
      nextSongInfo.userId,
      nextSongInfo.search,
    );
    if (!isTrackExists.data) {
      throw new NotFoundError(errorMessages.playlist.TrackNotExistsByIndex);
    }

    const formatSong = (songData: { track_id: string; id: string } | null, stopped = false) => {
      return {
        track_id: songData?.track_id,
        local_id: songData?.id,
        new_context: nextSongInfo.context,
        stopped,
      };
    };
    if (nextSongInfo.context === SongContext.Album) {
      const albumRecord = await playlist.getAlbumRecordById(nextSongInfo.id, nextSongInfo.userId);
      if (!albumRecord.success) {
        throw new NotFoundError(albumRecord.reason);
      }
    } else {
      const playlistRecord = await playlist.getPlaylistRecordById(playlistId, nextSongInfo.userId);
      if (!playlistRecord.success) {
        throw new NotFoundError(playlistRecord.reason);
      }
    }
    if (nextSongInfo.shuffle) {
      const nextSong = await playlist.getRandomPlaylistTrackByIndex({
        playlistId,
        currentTrackId: nextSongInfo.currentTrackId,
        index: nextSongInfo.index,
        userId: nextSongInfo.userId,
        search: nextSongInfo.search,
      });
      if (!nextSong.success) {
        throw new NotFoundError(nextSong.reason);
      }
      return formatSong(nextSong.data);
    }

    const nextSong = await playlist.getPlaylistTrackByIndex(
      playlistId,
      nextSongInfo.index + 1,
      nextSongInfo.userId,
      nextSongInfo.search,
    );

    if (!nextSong.data) {
      const firstSong = await playlist.getPlaylistTrackByIndex(
        playlistId,
        0,
        nextSongInfo.userId,
        nextSongInfo.search,
      );
      if (nextSongInfo.loop) {
        return formatSong(firstSong.data, false);
      }
      return formatSong(firstSong.data, true);
    }

    return formatSong(nextSong.data);
  },
  async discographyNextSong(nextSongInfo: GetNextSong & { userId: string }) {
    if (nextSongInfo.context !== SongContext.Releases || !nextSongInfo.userId) {
      throw new ValidationError('wrong context');
    }

    const playlistRecord = await track.getTrackById({
      trackId: nextSongInfo.id,
      userId: nextSongInfo.userId,
    });

    if (!playlistRecord.success) {
      throw new NotFoundError(playlistRecord.reason);
    }

    const formatSong = (
      songData: TrackWithAlbum | null,
      stopped = false,
      contextOverride?: SongContext,
    ) => ({
      track_id: songData?.id,
      local_id: songData?.album ? songData.album.playlist_album.playlist_id : null,
      new_context:
        contextOverride ?? (songData?.album_id ? SongContext.Album : nextSongInfo.context),
      stopped,
    });

    if (nextSongInfo.shuffle) {
      const nextSong = await artist.getRandomArtistTrack(nextSongInfo.currentTrackId);
      if (!nextSong.success) {
        throw new NotFoundError(nextSong.reason);
      }
      return formatSong(nextSong.data);
    }

    const nextSong = await artist.getNextDiscographyTrack(nextSongInfo.currentTrackId);
    if (!nextSong.success) {
      throw new NotFoundError(nextSong.reason);
    }

    if (!nextSong.data) {
      const firstSong = await artist.getTheLatestArtistTrack(nextSongInfo.currentTrackId);
      if (!firstSong.success) {
        throw new NotFoundError(firstSong.reason);
      }
      if (nextSongInfo.loop) {
        return formatSong(nextSong.data);
      }
      return formatSong(nextSong.data, true);
    }

    return formatSong(nextSong.data);
  },
  async artistTopNextSong(nextSongInfo: GetNextSong & { userId: string }) {
    if (!nextSongInfo.userId || nextSongInfo.context !== SongContext.ArtistTop10) {
      throw new ValidationError('wrong context');
    }

    const formatSong = (songData: TrackWithRelations | null, stopped = false) => ({
      track_id: songData?.id,
      local_id: null,
      new_context: nextSongInfo.context,
      stopped,
    });

    const artistRecord = await artist.getArtistById(nextSongInfo.id);
    if (!artistRecord.success) {
      throw new NotFoundError(artistRecord.reason);
    }

    if (nextSongInfo.shuffle) {
      const nextSong = await artist.artistTopNextTrack(
        {
          artistId: nextSongInfo.id,
          userId: nextSongInfo.userId,
          random: true,
        },
        10,
        nextSongInfo.index,
      );
      if (!nextSong.success) {
        throw new NotFoundError(nextSong.reason);
      }
      return formatSong(nextSong.data);
    }

    const nextSong = await artist.artistTopNextTrack(
      {
        artistId: nextSongInfo.id,
        userId: nextSongInfo.userId,
      },
      10,
      nextSongInfo.index,
    );

    if (!nextSong.success) {
      throw new NotFoundError(nextSong.reason);
    }

    if (!nextSong.data) {
      return await this.discographyNextSong({ ...nextSongInfo, context: SongContext.Releases });
    }
    return formatSong(nextSong.data);
  },
  async otherNextSong(nextSongInfo: GetNextSong & { userId: string }) {
    await this.playlistOrAlbumNextSong({
      ...nextSongInfo,
      context: SongContext.Liked,
      index: 0,
      currentTrackId: nextSongInfo.currentTrackId,
    });
  },
  async getNextSong(nextSongInfo: GetNextSong & { userId: string }) {
    const isUserExists = await user.getUserById(nextSongInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    switch (nextSongInfo.context) {
      case SongContext.ArtistTop10: {
        return this.artistTopNextSong(nextSongInfo);
      }
      case SongContext.Releases: {
        return this.discographyNextSong(nextSongInfo);
      }
      case SongContext.Playlist:
      case SongContext.Album:
      case SongContext.Liked: {
        return this.playlistOrAlbumNextSong(nextSongInfo);
      }
      default: {
        return this.otherNextSong(nextSongInfo);
      }
    }
  },
};
