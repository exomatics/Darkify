import { z } from 'zod/v4';

import { errorMessages } from './errors/error-messages.ts';
import { AlbumSpecificSortBy, AlbumsSortBy } from './interfaces/album-interface.ts';
import { LibrarySortBy, LibraryType } from './interfaces/library-interface.ts';
import { Restrictions, Type, OrderBy, PlaylistSortBy } from './interfaces/playlist-interface.ts';
import { LibrarySections } from './interfaces/user-interface.ts';
import { Bitrate } from './types/bitrate-type.ts';

const uuidScheme = z.uuid();

function requireAtLeastOneCheck(object: Record<string | number | symbol, unknown>) {
  return Object.values(object).some((value) => value !== undefined);
}
const paginationScheme = z.object({
  limit: z.number().max(100).nonnegative().optional(),
  offset: z.number().nonnegative().optional(),
});
const fileScheme = z.custom<Express.Multer.File>(
  (value) => {
    return value;
  },
  { message: errorMessages.user.GotNoFile },
);
const hashScheme = z
  .string()
  .regex(/^(0x|0h)?[0-9A-F]+$/i)
  .length(128);
const usernameScheme = z.string().max(25);
const emailScheme = z.email();
const passwordScheme = z
  .string()
  .min(8)
  .max(20)
  .refine((password) => /[A-Z]/.test(password), errorMessages.validation.PasswordNoCapital)

  .refine((password) => /[a-z]/.test(password), errorMessages.validation.PasswordNoNonCapital)

  .refine((password) => /\d/.test(password), errorMessages.validation.PasswordHasNoNumbers)

  .refine((password) => /^\S+$/.test(password), errorMessages.validation.PasswordHasSpaces)
  .refine(
    (password) => /[!@#$%^&*]/.test(password),

    errorMessages.validation.PasswordNoSpecialSymbols,
  );
const loginScheme = z
  .object({
    //username or email in one field
    username: usernameScheme.optional(),
    password: passwordScheme,
    email: emailScheme.optional(),
  })
  .refine(({ username, email }) => {
    return requireAtLeastOneCheck({ username, email });
  }, errorMessages.validation.SpecifyUsernameOrEmail);
const refreshTokenScheme = z.object({
  user_id: uuidScheme,
  hash: hashScheme,
});
const registerScheme = z.object({
  password: passwordScheme,
  email: emailScheme,
});
const userFollowScheme = z.object({
  user_id: uuidScheme,
  follow_id: uuidScheme,
});
const playlistFollowScheme = z.object({
  user_id: uuidScheme,
  playlist_id: uuidScheme,
});
const singleFollowScheme = z.object({
  user_id: uuidScheme,
  single_id: uuidScheme,
});
const userAvatarScheme = z.object({
  user_id: uuidScheme,
  file: fileScheme,
});
const userFollowingScheme = z.object({ user_id: uuidScheme }).extend(paginationScheme.shape);
const userBannerScheme = userAvatarScheme;

const updateUserScheme = z
  .object({
    user_id: uuidScheme,
    visible_username: z.string().max(25).optional(),
    description: z.string().max(1500).optional(),
  })
  .refine(({ visible_username, description }) => {
    return requireAtLeastOneCheck({ visible_username, description });
  }, errorMessages.validation.SpecifyWhatToUpdate);

const updateUserSettingsScheme = z.object({
  userId: uuidScheme,
  bitrate: z.enum(Bitrate),
});
const getTrackScheme = z.object({
  userId: uuidScheme,
  trackId: uuidScheme,
});
const trackNameScheme = z.string().max(100).nonempty();
const trackScheme = z.object({
  id: uuidScheme,
  lyrics: z.string().optional(),
  duration: z.string(),
});
const streamTrackScheme = z.object({
  trackId: uuidScheme,
  userId: uuidScheme,
});

const createTrackScheme = trackScheme
  .extend({
    name: trackNameScheme,
    admin_id: uuidScheme,
    albumId: uuidScheme.nullable(),
    artists: z.array(uuidScheme).refine((items) => new Set(items).size === items.length, {
      message: errorMessages.validation.UniqueArrayOfUuid,
    }),
    cover: fileScheme.array().nullable(),
    track: fileScheme.array().nullable(),
  })
  .omit({ duration: true, id: true });

const getTracksScheme = z.object({
  name: trackNameScheme,
  userId: uuidScheme,
  ...paginationScheme.shape,
});

const updateTrackScheme = trackScheme
  .extend({
    name: trackNameScheme.optional(),
    userId: uuidScheme,
    artists: z.array(uuidScheme).optional(),
    file: fileScheme.nullable(),
  })
  .omit({ duration: true })
  .refine(({ name, artists, lyrics, file }) => {
    return requireAtLeastOneCheck({ name, artists, lyrics, file });
  }, errorMessages.validation.SpecifyWhatToUpdate);

const playlistScheme = z.object({
  playlistId: uuidScheme,
  name: z.string().max(100).nonempty(),
  description: z.string().max(300).nonempty().optional(),
  coverId: uuidScheme,
  owner: uuidScheme,
  restrictions: z.enum(Restrictions),
  type: z.enum(Type),
});
const createPlaylistScheme = playlistScheme
  .omit({ playlistId: true, name: true, type: true, coverId: true })
  .extend({ file: fileScheme.nullable(), name: z.string().max(100).nullable() });

const getPlaylistsScheme = z.object({
  userId: uuidScheme,
  ...playlistScheme.pick({ name: true }).shape,
  ...paginationScheme.shape,
});

const getPlaylistInfoScheme = z.object({
  playlistId: uuidScheme,
  userId: uuidScheme,
});

const removeFromPlaylist = z.object({
  playlistId: uuidScheme,
  playlistTrackId: uuidScheme,
  userId: uuidScheme,
});
const addToPlaylist = z.object({
  playlistId: uuidScheme,
  trackId: uuidScheme,
  userId: uuidScheme,
});

const updatePlaylistInfoScheme = playlistScheme
  .pick({
    playlistId: true,
    name: true,
    description: true,
  })
  .extend({ userId: uuidScheme })
  .refine(({ name, description }) => {
    return requireAtLeastOneCheck({ name, description });
  }, errorMessages.validation.SpecifyWhatToUpdate);
const updatePlaylistRestrictions = playlistScheme
  .pick({
    playlistId: true,
    restrictions: true,
  })
  .extend({ userId: uuidScheme });
const updatePlaylistCoverScheme = z.object({
  playlistId: uuidScheme,
  userId: uuidScheme,
  file: fileScheme,
});
const getAllFromPlaylistScheme = z.object({
  playlistId: uuidScheme,
  userId: uuidScheme,
  sort: z.object({ sortBy: z.enum(PlaylistSortBy), order: z.enum(OrderBy) }),
  ...paginationScheme.shape,
});
const deletePlaylistScheme = z.object({
  playlistId: uuidScheme,
  userId: uuidScheme,
});
const reorderPlaylistScheme = z.object({
  playlistId: uuidScheme,
  userId: uuidScheme,
  fromIndex: z.int().nonnegative(),
  toIndex: z.int().gte(-1),
});
const reorderLibraryReleases = z.object({
  releaseId: uuidScheme,
  userId: uuidScheme,
  releaseType: z.enum(LibraryType),
  fromIndex: z.int().nonnegative(),
  toIndex: z.int().gte(-1),
});
const updateLibraryPlayDate = z.object({
  user_id: uuidScheme,
  event_data: z.union([
    z.object({
      section: z.literal(LibrarySections.PLAYLISTS),
      playlist_id: uuidScheme,
    }),
    z.object({
      section: z.literal(LibrarySections.ALBUMS),
      album_id: uuidScheme,
    }),
    z.object({
      section: z.literal(LibrarySections.SINGLES),
      track_id: uuidScheme,
    }),
  ]),
});

const getLibraryScheme = z.object({
  userId: uuidScheme,
});
const getLibraryArtistsScheme = getLibraryScheme;
const getLibraryItemsScheme = z.object({
  userId: uuidScheme,
  sort: z.object({ sortBy: z.enum(LibrarySortBy), order: z.enum(OrderBy) }),
  ...paginationScheme.shape,
});

const searchTrackInPlaylist = z.object({
  userId: uuidScheme,
  playlistId: uuidScheme,
  search: z.string().max(100).nonoptional(),
  sort: z.object({ sortBy: z.enum(PlaylistSortBy), order: z.enum(OrderBy) }),
  ...paginationScheme.shape,
});
const getLikedScheme = z.object({
  userId: uuidScheme,
  search: z.string().max(100).optional(),
  sort: z.object({ sortBy: z.enum(PlaylistSortBy), order: z.enum(OrderBy) }),
  ...paginationScheme.shape,
});
const reorderLikedScheme = reorderPlaylistScheme.omit({ playlistId: true });

const addToLikedScheme = addToPlaylist.omit({ playlistId: true });

const removeFromLikedScheme = removeFromPlaylist.omit({ playlistId: true });

const getMyAlbumsScheme = z.object({
  userId: uuidScheme,
  sort: z.object({ sortBy: z.enum(AlbumsSortBy), order: z.enum(OrderBy) }),
  ...paginationScheme.shape,
});

const createAlbumScheme = playlistScheme
  .omit({ playlistId: true, description: true, type: true, coverId: true })
  .extend({ file: fileScheme.nullable() });

const updateAlbumInfoScheme = z.object({
  name: z.string().max(100),
  albumId: uuidScheme,
  userId: uuidScheme,
});
const releaseAlbumScheme = z.object({
  albumId: uuidScheme,
  userId: uuidScheme,
  releaseDate: z.iso.datetime().nullable().optional(),
});
const getAlbumInfoScheme = getPlaylistInfoScheme
  .omit({ playlistId: true })
  .extend({ albumId: uuidScheme });

const getAllFromAlbumScheme = getAllFromPlaylistScheme
  .omit({ playlistId: true, sort: true })
  .extend({
    albumId: uuidScheme,
    sort: z.object({
      sortBy: z.enum({ ...PlaylistSortBy, ...AlbumSpecificSortBy }),
      order: z.enum(OrderBy),
    }),
  });

const addToAlbumScheme = addToPlaylist.omit({ playlistId: true }).extend({ albumId: uuidScheme });

const removeFromAlbumScheme = removeFromPlaylist
  .omit({ playlistId: true, playlistTrackId: true })
  .extend({ albumId: uuidScheme, albumTrackId: uuidScheme });

const reorderAlbumScheme = reorderPlaylistScheme
  .omit({ playlistId: true })
  .extend({ albumId: uuidScheme });

const updateAlbumCoverScheme = updatePlaylistCoverScheme
  .omit({ playlistId: true })
  .extend({ albumId: uuidScheme });

const deleteAlbumScheme = deletePlaylistScheme
  .omit({ playlistId: true })
  .extend({ albumId: uuidScheme, keepTracks: z.boolean().optional() });

const artistScheme = z.object({
  userId: uuidScheme,
  description: z.string().max(1500).nonempty().optional(),
  bannerId: uuidScheme.optional(),
});

const createArtistScheme = artistScheme
  .omit({ bannerId: true })
  .extend({ file: fileScheme.nullable() });

const getArtistScheme = z.object({
  userId: uuidScheme,
  artistId: uuidScheme,
});
const getArtistLikedScheme = getArtistScheme.extend(paginationScheme.shape);
const getArtistAlbumsScheme = getArtistLikedScheme;
const getArtistSinglesScheme = getArtistLikedScheme;
const getArtistTopTracks = getArtistScheme;
const getArtistTop = getArtistScheme;

const searchScheme = z.object({ search: z.string(), userId: uuidScheme });
const searchWithPaginationScheme = searchScheme.extend(paginationScheme.shape);
export {
  uuidScheme,
  loginScheme,
  refreshTokenScheme,
  registerScheme,
  userFollowingScheme,
  updateUserScheme,
  updateUserSettingsScheme,
  userFollowScheme,
  playlistFollowScheme,
  userAvatarScheme,
  userBannerScheme,
  getTrackScheme,
  getTracksScheme,
  createTrackScheme,
  updateTrackScheme,
  streamTrackScheme,
  getPlaylistsScheme,
  getPlaylistInfoScheme,
  createPlaylistScheme,
  addToPlaylist,
  removeFromPlaylist,
  updatePlaylistRestrictions,
  updatePlaylistInfoScheme,
  updatePlaylistCoverScheme,
  getAllFromPlaylistScheme,
  reorderPlaylistScheme,
  deletePlaylistScheme,
  updateLibraryPlayDate,
  getLibraryScheme,
  getLibraryArtistsScheme,
  getLibraryItemsScheme,
  reorderLibraryReleases,
  searchTrackInPlaylist,
  getLikedScheme,
  reorderLikedScheme,
  addToLikedScheme,
  removeFromLikedScheme,
  getMyAlbumsScheme,
  createAlbumScheme,
  updateAlbumInfoScheme,
  releaseAlbumScheme,
  getAlbumInfoScheme,
  getAllFromAlbumScheme,
  addToAlbumScheme,
  removeFromAlbumScheme,
  reorderAlbumScheme,
  updateAlbumCoverScheme,
  deleteAlbumScheme,
  createArtistScheme,
  getArtistScheme,
  getArtistLikedScheme,
  getArtistAlbumsScheme,
  getArtistSinglesScheme,
  getArtistTopTracks,
  getArtistTop,
  singleFollowScheme,
  searchScheme,
  searchWithPaginationScheme,
};
