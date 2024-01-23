import { LiveReload, useSWEffect } from "@remix-pwa/sw";
import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { CalendarIcon, HomeIcon, SettingsIcon, TrendsIcon } from "./icons";
import styles from "./styles/tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

const navs = [
  { to: "/", icon: HomeIcon },
  { to: "/calendar", icon: CalendarIcon },
  { to: "/trends", icon: TrendsIcon },
  { to: "/settings", icon: SettingsIcon },
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
      <body className="bg-gray-100 max-w-lg mx-auto">
        <div className="min-h-dvh flex flex-col justify-end">
          <div>
            <Outlet />
          </div>
          <div className="sticky bottom-0 w-full flex justify-between py-4 border-t border-gray-300 px-4 my-4">
            {navs.map((nav) => (
              <div key={nav.to}>
                <Link to={nav.to}>
                  <nav.icon
                    className={`w-8 h-8 ${
                      location.pathname === nav.to
                        ? "text-gray-700 stroke-2"
                        : "text-gray-500"
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
