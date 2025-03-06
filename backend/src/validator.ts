import { z } from 'zod';

import database from './config/database.ts';
import NotFoundError from './errors/not-found-error.ts';

const uuidScheme = z.string().uuid();
const hashScheme = z
  .string()
  .regex(/^(0x|0h)?[0-9A-F]+$/i)
  .length(128);
const usernameScheme = z.string().max(25);
const emailScheme = z.string().email();
const userIdScheme = uuidScheme.refine(async (userId) => {
  const fullUserInfo = await database.userModel.findByPk(userId);
  if (fullUserInfo === null) {
    return new NotFoundError('User with this id does not exist');
  }
});
const passwordScheme = z
  .string()
  .min(8)
  .max(20)
  .refine((password) => /[A-Z]/.test(password), '1')
  .refine((password) => /[a-z]/.test(password), '2')
  .refine((password) => /\d/.test(password), '3')
  .refine((password) => /[!@#$%^&*]/.test(password), '4');
const loginScheme = z
  .object({
    username: usernameScheme.optional(),
    password: passwordScheme,
    email: emailScheme.optional(),
  })
  //отключено до рефакторинга ошибок
  // eslint-disable-next-line i18n-text/no-en
  .refine((data) => data.email ?? data.username, 'Either email or username need to be filled in.');
const refreshTokenScheme = z.object({
  id: uuidScheme,
  hash: hashScheme,
});
const registerScheme = z.object({
  password: passwordScheme,
  email: emailScheme,
});

const isArtistScheme = z.boolean();
const followersIdScheme = z.array(uuidScheme);
const followingIdScheme = z.array(uuidScheme);
const playlistsScheme = z.array(uuidScheme);
const visibleUsernameScheme = z.string();

const updateUserScheme = z.object({
  userId: uuidScheme,
  isArtist: isArtistScheme,
  followersId: followersIdScheme,
  followingId: followingIdScheme,
  playlists: playlistsScheme,
  visibleUsername: visibleUsernameScheme,
});

export {
  uuidScheme,
  loginScheme,
  refreshTokenScheme,
  registerScheme,
  updateUserScheme,
  userIdScheme,
};
