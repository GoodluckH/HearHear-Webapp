import { json, type LinksFunction, type LoaderFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import type { DiscordUser } from "./auth.server";
import { auth } from "./auth.server";
import { Analytics } from "@vercel/analytics/react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export let loader: LoaderFunction = async ({ request }) => {
  let user = await auth.isAuthenticated(request);

  if (!user) {
    return json({ user: undefined });
  }
  return json({ user });
};
export default function App() {
  useLoaderData<{ user: DiscordUser | undefined }>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body>
        <Outlet />
        <Analytics />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
