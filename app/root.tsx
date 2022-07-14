import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix";
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";
import { Notification } from "@prisma/client";

import tailwindStylesheetUrl from "./styles/tailwind.css";

import { prisma } from "./services/db.server";
import { getUser } from "./services/session.server";
import { getUnreadNotificationsByUserId } from "./models/notification.server";

import { PusherProvider } from "./context/PusherContext";

export const links: LinksFunction = () => {
  return [
    { rel: "manifest", href: "/manifest.json" },
    { rel: "stylesheet", href: tailwindStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "SuperFunApp",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  PUSHER_APP_KEY: string | undefined;
  user: Awaited<ReturnType<typeof getUser>>;
  notifications: Awaited<ReturnType<typeof getUnreadNotificationsByUserId>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  let unreadMessageCount;
  let notifications: Notification[] = [];

  if (user) {
    notifications = await getUnreadNotificationsByUserId(user.id);

    //TODO : move query to model file
    const where = user.lastReadMessages
      ? { userId: { not: user.id }, createdAt: { gt: user.lastReadMessages } }
      : {};

    unreadMessageCount = await prisma.message.count({
      where,
    });

    if (unreadMessageCount > 0) {
      notifications.push({
        id: -1,
        userId: user.id,
        message: `You have ${unreadMessageCount} unread chat messages`,
        href: "/chat",
        read: false,
      });
    }
  }

  return json<LoaderData>({
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY,
    user,
    notifications,
  });
};

export default function App() {
  const { PUSHER_APP_KEY } = useLoaderData<LoaderData>();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex h-screen w-screen flex-col overflow-x-hidden">
        <PusherProvider appKey={PUSHER_APP_KEY}>
          <Outlet />
        </PusherProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
