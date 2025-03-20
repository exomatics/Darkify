import { z } from 'zod';

import database from './config/database.ts';
import NotFoundError from './errors/not-found-error.ts';

const uuidScheme = z.string().uuid();

function requireAtLeastOneCheck(object: Record<string | number | symbol, unknown>) {
  Object.values(object).some((value) => value !== undefined);
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
    throw new NotFoundError('User with this id does not exist');
  }
  return true;
});
const passwordScheme = z
  .string()
  .min(8)
  .max(20)
  // eslint-disable-next-line i18n-text/no-en
  .refine((password) => /[A-Z]/.test(password), 'Password has no capital letters')
  // eslint-disable-next-line i18n-text/no-en
  .refine((password) => /[a-z]/.test(password), 'Password has no non-capital letters')
  // eslint-disable-next-line i18n-text/no-en
  .refine((password) => /\d/.test(password), 'Password must not contain spaces')
  .refine(
    (password) => /[!@#$%^&*]/.test(password),
    // eslint-disable-next-line i18n-text/no-en
    'Password must have at least on special symbol !@#$%^&*',
  );
const loginScheme = z
  .object({
    username: usernameScheme.optional(),
    password: passwordScheme,
    email: emailScheme.optional(),
  })
  .refine(({ username, email }) => {
    requireAtLeastOneCheck({ username, email });
    // eslint-disable-next-line i18n-text/no-en
  }, 'Either email or username need to be filled in');
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

const visibleUsernameScheme = z.string();

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
};
