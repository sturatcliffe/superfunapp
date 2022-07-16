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
import { Item, Notification } from "@prisma/client";

import tailwindStylesheetUrl from "./styles/tailwind.css";

import { prisma } from "./services/db.server";
import { getUser } from "./services/session.server";
import { getUnreadNotificationsByUserId } from "./models/notification.server";
import { getWatchedItemsWithoutScore } from "./models/item.server";

import { PusherProvider } from "./context/PusherContext";
import { useEffect, useState } from "react";

import VoteAllWatchedModal from "./components/VoteAllWatchedModal";

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
  items: Awaited<ReturnType<typeof getWatchedItemsWithoutScore>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  let unreadMessageCount;
  let notifications: Notification[] = [];
  let items: Item[] = [];

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

    items = await getWatchedItemsWithoutScore({ userId: user.id });
  }

  return json<LoaderData>({
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY,
    user,
    notifications,
    items,
  });
};

export default function App() {
  const { PUSHER_APP_KEY, items } = useLoaderData<LoaderData>();

  const [showModal, setShowModal] = useState(items.length > 0);

  useEffect(() => {
    setShowModal(items.length > 0);
  }, [items]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex h-screen w-screen flex-col overflow-x-hidden">
        <VoteAllWatchedModal
          open={showModal}
          items={items}
          cancelHandler={() => setShowModal(false)}
        />
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
