import { redirect } from '@remix-run/node';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { combineResponseInits } from '~/utils/misc';
import { authSessionStorage } from '~/utils/sessions/auth.session.server';

export async function handleNewSession(
  {
    request,
    session,
    redirectTo,
  }: {
    request: Request;
    session: { userId: number; id: number; expirationDate: Date };
    redirectTo?: string;
  },
  responseInit?: ResponseInit,
) {
  // const hasTwoFactor = await userHasTwoFactor(session.userId);

  // if (hasTwoFactor) {
  //   const verifySession = await verifySessionStorage.getSession();
  //   verifySession.set(unverifiedSessionIdKey, session.id);
  //   const redirectUrl = getRedirectToUrl({
  //     request,
  //     type: "2fa",
  //     target: session.userId.toString(),
  //     redirectTo,
  //   });
  //   return redirect(
  //     `${redirectUrl.pathname}?${redirectUrl.searchParams}`,
  //     combineResponseInits(
  //       {
  //         headers: {
  //           "set-cookie":
  //             await verifySessionStorage.commitSession(verifySession),
  //         },
  //       },
  //       responseInit
  //     )
  //   );
  // } else {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  );
  authSession.set('sessionId', session.id);

  return redirect(
    safeRedirect(redirectTo ?? '/app'),
    combineResponseInits(
      {
        headers: {
          'set-cookie': await authSessionStorage.commitSession(authSession, {
            expires: session.expirationDate,
          }),
        },
      },
      responseInit,
    ),
  );
  // }
}
