import { LiveReload, useSWEffect } from '@remix-pwa/sw';
import type { LinksFunction } from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from '@remix-run/react';
import { CalendarIcon, HomeIcon, SettingsIcon, TrendsIcon } from './icons';
import styles from './styles/tailwind.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

const navs = [
  { to: '/', icon: HomeIcon },
  { to: '/calendar', icon: CalendarIcon },
  { to: '/trends', icon: TrendsIcon },
  { to: '/settings', icon: SettingsIcon },
];

export default function App() {
  useSWEffect();
  const location = useLocation();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="manifest.webmanifest" />
        <Meta />
        <Links />
      </head>
      <body className="mx-auto max-w-lg bg-gray-100">
        <div className="flex min-h-dvh flex-col justify-end">
          <div>
            <Outlet />
          </div>
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
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
