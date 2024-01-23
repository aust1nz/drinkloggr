import { createCookieSessionStorage } from '@remix-run/node';
import { GoogleProvider } from '../auth/google.server';

export const connectionSessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_connection',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    secrets: process.env.SESSION_SECRET.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
});

export function resolveConnectionData() {
  return new GoogleProvider().resolveConnectionData();
}
