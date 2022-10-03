import { useEffect, useState } from "react";
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
import globalStylesheetUrl from "./styles/global.css";

import { getUser } from "./services/session.server";
import { getUnreadNotificationsByUserId } from "./models/notification.server";
import { getWatchedItemsWithoutScore } from "./models/item.server";

import VoteAllWatchedModal from "./components/VoteAllWatchedModal";

export const links: LinksFunction = () => {
  return [
    { rel: "manifest", href: "/manifest.json" },
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: globalStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "SuperFunApp",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  notifications: Awaited<ReturnType<typeof getUnreadNotificationsByUserId>>;
  items: Awaited<ReturnType<typeof getWatchedItemsWithoutScore>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  let notifications: Notification[] = [];
  let items: Item[] = [];

  if (user) {
    notifications = await getUnreadNotificationsByUserId(user.id);
    items = await getWatchedItemsWithoutScore({ userId: user.id });
  }

  return json<LoaderData>({
    user,
    notifications,
    items,
  });
};

export default function App() {
  const { items } = useLoaderData<LoaderData>();

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
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
