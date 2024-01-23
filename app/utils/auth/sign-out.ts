import { redirect } from '@remix-run/node';
import { deleteDbSession } from '~/queries/sessions.server';
import { combineHeaders } from '../misc';
import {
  authSessionStorage,
  sessionKey,
} from '../sessions/auth.session.server';

export async function logout(
  {
    request,
  }: {
    request: Request;
  },
  responseInit?: ResponseInit,
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  );
  const sessionId = authSession.get(sessionKey);
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  if (sessionId) {
    // the .catch is important because that's what triggers the query.
    // learn more about PrismaPromise: https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismapromise-behavior
    await deleteDbSession(sessionId);
  }
  throw redirect('/', {
    ...responseInit,
    headers: combineHeaders(
      { 'set-cookie': await authSessionStorage.destroySession(authSession) },
      responseInit?.headers,
    ),
  });
}
