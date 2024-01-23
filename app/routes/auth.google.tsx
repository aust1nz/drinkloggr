import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/utils/auth/authenticator';
import { getRedirectCookieHeader, getReferrerRoute } from '~/utils/misc';

export async function loader() {
  return redirect('/login');
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    return await authenticator.authenticate('google', request);
  } catch (error: unknown) {
    if (error instanceof Response) {
      const formData = await request.formData();
      const rawRedirectTo = formData.get('redirectTo');
      const redirectTo =
        typeof rawRedirectTo === 'string'
          ? rawRedirectTo
          : getReferrerRoute(request);
      const redirectToCookie = getRedirectCookieHeader(redirectTo);
      if (redirectToCookie) {
        error.headers.append('set-cookie', redirectToCookie);
      }
    }
    throw error;
  }
}
