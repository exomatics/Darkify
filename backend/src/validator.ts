import { z } from 'zod';

const uuidScheme = z.string().uuid();
const hashScheme = z
  .string()
  .regex(/^(0x|0h)?[0-9A-F]+$/i)
  .length(128);
const usernameScheme = z.string().max(25);
const emailScheme = z.string().email();
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
export { uuidScheme, loginScheme, refreshTokenScheme, registerScheme };
