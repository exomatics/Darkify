import { z } from 'zod/v4';

import database from './config/database.ts';
import { errorMessages } from './errors/error-messages.ts';
import NotFoundError from './errors/not-found-error.ts';
import { Bitrate } from './types/bitrate-type.ts';
import { Restrictions } from './types/restrictions-type.ts';
import { Type } from './types/playlist-type.ts';
import { Order, sortBy } from './interfaces/playlist-interface.ts';
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
    artists: z.array(uuidScheme),
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
    artists: z.array(z.string()).optional(),
    file: fileScheme.nullable(),
  })
  .omit({ duration: true })
  .refine(({ name, artists, lyrics, file }) => {
    return requireAtLeastOneCheck({ name, artists, lyrics, file });
  }, errorMessages.validation.SpecifyToUpdateTrack);

const playlistScheme = z.object({
  playlistId: uuidScheme,
  name: z.string().max(100).nonempty(),
  description: z.string().max(300).nonempty(),
  cover_id: uuidScheme,
  owner: uuidScheme,
  restrictions: z.enum(Restrictions),
  type: z.enum(Type),
});

const getPlaylistsScheme = z.object({
  ...playlistScheme.pick({ name: true }).shape,
  ...paginationScheme.shape,
});

const getPlaylistInfo = playlistScheme.pick({ playlistId: true });

const updatePlaylistScheme = z.object({
  playlistId: uuidScheme,
  trackId: uuidScheme,
  userId: uuidScheme,
});

const updatePlaylistInfoScheme = playlistScheme.pick({
  playlistId: true,
  name: true,
  description: true,
});
const updatePlaylistRestrictions = playlistScheme.pick({
  playlistId: true,
  restrictions: true,
});
const updatePlaylistCoverScheme = z.object({
  playlistId: uuidScheme,
  file: fileScheme,
});
const getAllFromPlaylistScheme = z.object({
  playlistId: uuidScheme,
  sort: z.object({ sort: sortBy, order: Order }),
  ...paginationScheme.shape,
});

const reorderPlaylistScheme = z.object({
  playlistId: uuidScheme,
  trackId: uuidScheme,
  order: z.int().positive(),
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
  getPlaylistInfo,
  updatePlaylistScheme,
  updatePlaylistRestrictions,
  updatePlaylistInfoScheme,
  updatePlaylistCoverScheme,
  getAllFromPlaylistScheme,
  reorderPlaylistScheme,
};
