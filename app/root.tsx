import { LiveReload, useSWEffect } from '@remix-pwa/sw';
import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import { CalendarIcon, HomeIcon, SettingsIcon, TrendsIcon } from './icons';
import styles from './styles/tailwind.css';
import { getUserId } from './utils/auth/get-user-id';
import { ClientHintCheck, getHints, useHints } from './utils/get-hints';
import { useNonce } from './utils/nonce-provider';
import { useRequestInfo } from './utils/request-info';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

const navs = [
  { to: '/', icon: HomeIcon },
  { to: '/calendar', icon: CalendarIcon },
  { to: '/trends', icon: TrendsIcon },
  { to: '/settings', icon: SettingsIcon },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  return json({
    requestInfo: {
      hints: getHints(request),
    },
    userId,
  });
};

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTimezone() {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  return requestInfo.hints.timeZone ?? hints.timeZone;
}

export default function App() {
  useSWEffect();
  const location = useLocation();
  const { userId } = useLoaderData<typeof loader>();
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="manifest.webmanifest" />
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <Links />
      </head>
      <body className="mx-auto max-w-lg bg-gray-100">
        <div className="flex min-h-dvh flex-col justify-end">
          <div>
            <Outlet />
          </div>
          {userId && (
            <div className="sticky bottom-0 my-4 flex w-full justify-between border-t border-gray-300 px-4 py-4">
              {navs.map((nav) => (
                <div key={nav.to}>
                  <Link to={nav.to}>
                    <nav.icon
                      className={`h-8 w-8 ${
                        location.pathname === nav.to
                          ? 'stroke-2 text-gray-700'
                          : 'text-gray-500'
                      } hover:text-blue-700`}
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
