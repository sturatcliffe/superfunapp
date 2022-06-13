import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./services/session.server";
import { prisma } from "./services/db.server";
import { useLoaderData } from "@remix-run/react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "SuperFunApp",
  viewport: "width=device-width,initial-scale=1",
});

type ENV = {
  PUSHER_APP_KEY: string | undefined;
};

type LoaderData = {
  ENV: ENV;
  user: Awaited<ReturnType<typeof getUser>>;
  unreadMessageCount: number | undefined;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  let unreadMessageCount;

  if (user) {
    const where = user.lastReadMessages
      ? { createdAt: { gt: user.lastReadMessages } }
      : {};

    unreadMessageCount = await prisma.message.count({
      where,
    });
  }

  return json<LoaderData>({
    ENV: {
      PUSHER_APP_KEY: process.env.PUSHER_APP_KEY,
    },
    user,
    unreadMessageCount,
  });
};

export default function App() {
  const data = useLoaderData();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen">
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
