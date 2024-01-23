import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { createDbSession } from '~/queries/sessions.server';
import { createUser, findUserBySub } from '~/queries/users.server';
import { authenticator } from '~/utils/auth/authenticator';
import { combineHeaders, destroyRedirectToHeader } from '~/utils/misc';
import { handleNewSession } from '~/utils/sessions/handle-new-session';

const destroyRedirectTo = { 'set-cookie': destroyRedirectToHeader };

async function makeSession(
  {
    request,
    userId,
    redirectTo,
  }: { request: Request; userId: number; redirectTo?: string | null },
  responseInit?: ResponseInit,
) {
  redirectTo ??= '/';
  const session = await createDbSession(userId);
  return handleNewSession(
    { request, session, redirectTo },
    { headers: combineHeaders(responseInit?.headers, destroyRedirectTo) },
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const providerName = 'google';

  const authResult = await authenticator
    .authenticate(providerName, request, { throwOnError: true })
    .then(
      (data) => ({ success: true, data }) as const,
      (error) => ({ success: false, error }) as const,
    );

  if (!authResult.success) {
    console.error(authResult.error);
    throw redirect('/', { headers: destroyRedirectTo });
  }

  const { data: profile } = authResult;
  const existingUser = await findUserBySub(profile.id);

  // Connection exists already? Make a new session
  if (existingUser) {
    return makeSession({ request, userId: existingUser.id });
  }

  // this is a new user, so let's get them onboarded
  const newUser = await createUser({
    email: profile.email.toLowerCase(),
    name: profile.name,
    googleSub: profile.id,
  });

  return makeSession({ request, userId: newUser.id });
}
