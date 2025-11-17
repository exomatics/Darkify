import { z } from 'zod/v4';

import database from './config/database.ts';
import { errorMessages } from './errors/error-messages.ts';
import NotFoundError from './errors/not-found-error.ts';
import { LibrarySortBy } from './interfaces/library-interface.ts';
import { Restrictions, Type, Order, sortBy } from './interfaces/playlist-interface.ts';
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
const userIdScheme = uuidScheme.refine(async (user_id) => {
  const fullUserInfo = await database.userModel.findByPk(user_id);
  if (!fullUserInfo) {
    throw new NotFoundError(errorMessages.user.NotExistsById);
  }
  return true;
});
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
const userAvatarScheme = z.object({
  user_id: uuidScheme,
  file: fileScheme,
});
const visibleUsernameScheme = z.string().max(25);

const updateUserScheme = z.object({
  user_id: uuidScheme,
  visible_username: visibleUsernameScheme,
});

const updateUserSettingsScheme = z.object({
  userId: uuidScheme,
  bitrate: z.enum(Bitrate),
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
    artists: z.array(uuidScheme).refine((items) => new Set(items).size === items.length, {
      message: 'Must be an array of unique strings',
    }),
    file: fileScheme.array().nullable(),
  })
  .omit({ duration: true, id: true });

const getTracksScheme = z.object({
  name: trackNameScheme,
  ...paginationScheme.shape,
});

const updateTrackScheme = trackScheme
  .extend({
    name: trackNameScheme.optional(),
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
  sort: z.object({ sortBy: z.enum(sortBy), order: z.enum(Order) }),
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
const updateLibraryPlayDate = z.object({
  user_id: uuidScheme,
  event_data: z.union([
    z.object({
      section: z.literal(LibrarySections.PLAYLISTS),
      playlist_id: uuidScheme,
    }),
    //just add albums and artists in union later
  ]),
});
const getLibraryPlaylistsScheme = z.object({
  userId: uuidScheme,
  sort: z.object({ sortBy: z.enum(LibrarySortBy), order: z.enum(Order) }),
  ...paginationScheme.shape,
});
export {
  uuidScheme,
  loginScheme,
  refreshTokenScheme,
  registerScheme,
  updateUserScheme,
  updateUserSettingsScheme,
  userIdScheme,
  userFollowScheme,
  playlistFollowScheme,
  userAvatarScheme,
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
  getLibraryPlaylistsScheme,
};
