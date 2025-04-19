import { z } from 'zod';

import database from './config/database.ts';
import { errorMessages } from './errors/error-messages.ts';
import NotFoundError from './errors/not-found-error.ts';

const uuidScheme = z.string().uuid();
function requireAtLeastOneCheck(object: Record<string | number | symbol, unknown>) {
  return Object.values(object).some((value) => value !== undefined);
}
const hashScheme = z
  .string()
  .regex(/^(0x|0h)?[0-9A-F]+$/i)
  .length(128);
const usernameScheme = z.string().max(25);
const emailScheme = z.string().email();
const userIdScheme = uuidScheme.refine(async (userId) => {
  const fullUserInfo = await database.userModel.findByPk(userId);
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
    username: usernameScheme.optional(),
    password: passwordScheme,
    email: emailScheme.optional(),
  })
  .refine(({ username, email }) => {
    return requireAtLeastOneCheck({ username, email });
  }, errorMessages.validation.SpecifyUsernameOrEmail);
const refreshTokenScheme = z.object({
  id: uuidScheme,
  hash: hashScheme,
});
const registerScheme = z.object({
  password: passwordScheme,
  email: emailScheme,
});
const userFollowScheme = z.object({
  userId: uuidScheme,
  followId: uuidScheme,
});
const playlistFollowScheme = z.object({
  userId: uuidScheme,
  playlistId: uuidScheme,
});
const userAvatarScheme = z.object({
  userId: uuidScheme,
  file: z.custom<Express.Multer.File>(
    (value: Express.Multer.File) => {
      return value;
    },
    { message: errorMessages.user.GotNoFile },
  ),
});
const visibleUsernameScheme = z.string().max(25);

const updateUserScheme = z.object({
  userId: uuidScheme,
  visibleUsername: visibleUsernameScheme,
});

export {
  uuidScheme,
  loginScheme,
  refreshTokenScheme,
  registerScheme,
  updateUserScheme,
  userIdScheme,
  userFollowScheme,
  playlistFollowScheme,
  userAvatarScheme,
};
