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
  useSearchParams,
} from "remix";
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";
import { Item, Notification } from "@prisma/client";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import globalStylesheetUrl from "./styles/global.css";

import { getUser } from "./services/session.server";
import { getUnreadNotificationsByUserId } from "./domain/notification.server";
import {
  getMostRecentItemByTT,
  getWatchedItemsWithoutScore,
} from "./domain/item.server";

import VoteAllWatchedModal from "./components/VoteAllWatchedModal";
import AddToFriendsListModal from "./components/AddToFriendsListModal";
import { getUsersWhoHaventWatched } from "./domain/user.server";

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

export type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  notifications: Awaited<ReturnType<typeof getUnreadNotificationsByUserId>>;
  items: Awaited<ReturnType<typeof getWatchedItemsWithoutScore>>;
  title: {
    tt: string;
    title: string;
    description: string;
    image: string;
    url: string;
  } | null;
  users: Awaited<ReturnType<typeof getUsersWhoHaventWatched>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const url = new URL(request.url);
  const tt = url.searchParams.get("add");

  let notifications: Notification[] = [];
  let items: Item[] = [];
  let title = null;
  let users: { id: number; name: string; email: string }[] = [];

  if (user) {
    notifications = await getUnreadNotificationsByUserId(user.id);
    items = await getWatchedItemsWithoutScore({ userId: user.id });
  }

  if (tt) {
    title = await getMostRecentItemByTT(tt);
    users = await getUsersWhoHaventWatched(tt);
  }

  return json<LoaderData>({
    user,
    notifications,
    items,
    title,
    users,
  });
};

export default function App() {
  const { items } = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();

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
        {searchParams.get("add") && <AddToFriendsListModal />}
      </body>
    </html>
  );
}
