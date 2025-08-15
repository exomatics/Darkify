import { z } from 'zod/v4';

import database from './config/database.ts';
import { errorMessages } from './errors/error-messages.ts';
import NotFoundError from './errors/not-found-error.ts';
import { Bitrate } from './types/bitrate-type.ts';
const uuidScheme = z.uuid();
function requireAtLeastOneCheck(object: Record<string | number | symbol, unknown>) {
  return Object.values(object).some((value) => value !== undefined);
}
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
  file: z.custom<Express.Multer.File>(
    (value) => {
      return value;
    },
    { message: errorMessages.user.GotNoFile },
  ),
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

const trackCoverScheme = z.custom<Express.Multer.File>(
  (value) => {
    return value;
  },
  { message: errorMessages.user.GotNoFile },
);

const createTrackScheme = trackScheme
  .extend({
    name: trackNameScheme,
    admin_id: uuidScheme,
    artists: z.array(uuidScheme),
    file: trackCoverScheme,
  })
  .omit({ duration: true, id: true });

const getTracksScheme = trackNameScheme;

const updateTrackScheme = trackScheme
  .extend({
    name: trackNameScheme.optional(),
    artists: z.array(z.string()).optional(),
    file: trackCoverScheme,
  })
  .omit({ duration: true })
  .refine(({ name, artists, lyrics }) => {
    return requireAtLeastOneCheck({ name, artists, lyrics });
  }, errorMessages.validation.SpecifyToUpdateTrack);

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
};
