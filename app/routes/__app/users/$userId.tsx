import { Fragment, useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { LoaderFunction, ActionFunction, useTransition } from "remix";
import { json, useLoaderData, useCatch, useActionData } from "remix";
import invariant from "tiny-invariant";
import { ArrowUpIcon } from "@heroicons/react/outline";
import {
  NotificationEvent,
  NotificationMethod,
  WatchStatus,
} from "@prisma/client";

import {
  getWatchlistItems,
  upsertItem,
  markAsWatched,
  deleteItem,
} from "~/models/item.server";
import { createNotification } from "~/models/notification.server";
import { getUserById } from "~/models/user.server";
import type { User } from "~/models/user.server";

import { requireUser, requireUserId } from "~/services/session.server";
import { sendMail } from "~/services/email.server";
import { sendSms } from "~/services/sms.server";

import WatchList from "~/components/WatchList";
import type { Fields } from "~/components/AddNewItemForm";
import AddNewItemForm from "~/components/AddNewItemForm";
import { searchImdb, scrapeImdbData } from "~/services/imdb.server";
import type { SearchResult } from "~/services/imdb.server";

type LoaderData = {
  items: Awaited<ReturnType<typeof getWatchlistItems>>;
  userId: number;
};

type ActionData = {
  results?: SearchResult[];
  errors?: Fields;
  deleted?: boolean;
};

export const SEARCH_ACTION = "search";
export const CREATE_ACTION = "create";
export const DELETE_ACTION = "delete";
export const UPDATE_WATCH_STATUS_ACTION = "UpdateWatchStatus";

const handleSearch = async (formData: FormData) => {
  const q = formData.get("q") as string | undefined;

  if (typeof q !== "string") {
    return json<ActionData>(
      { errors: { url: "You must enter a search term" } },
      { status: 400 }
    );
  }

  const results = await searchImdb(q as string);
  return json<ActionData>({ results });
};

const handleCreate = async (
  formData: FormData,
  userId: number,
  currentUser: User,
  baseUrl: string
) => {
  const url = formData.get("url") as string | undefined;

  if (
    typeof url !== "string" ||
    !url.startsWith("https://www.imdb.com/title/")
  ) {
    return json<ActionData>(
      { errors: { url: "You must enter a valid IMDB URL" } },
      { status: 400 }
    );
  }

  const { tt, title, description, image } = await scrapeImdbData(url);

  if (
    typeof tt !== "string" ||
    !tt.startsWith("tt") ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string"
  ) {
    return json<ActionData>(
      { errors: { url: "Failed to scrape data from that URL." } },
      { status: 400 }
    );
  }

  await upsertItem({
    tt,
    title,
    description,
    url,
    image,
    userId,
    createdById: currentUser.id,
  });

  if (currentUser.id != userId) {
    const otherUser = await getUserById(userId);
    if (
      otherUser?.preferences.find(
        (x) =>
          x.event === NotificationEvent["Watchlist"] &&
          x.method === NotificationMethod["Email"]
      )?.enabled
    ) {
      const body = `
        <p>Hello${otherUser.name ? ` ${otherUser.name}` : ""},</p>
        <p>${
          currentUser.name ?? currentUser.email
        } has just added <b>${title}</b> to your watchlist!</p>
        <p>Check it out <a href="${baseUrl}/users/${userId}">here</a>.</p>
        <p>Toodles!</p>
      `;

      await sendMail(
        otherUser.name ?? otherUser.email,
        otherUser.email,
        "SuperFunApp: A new item has been added to your watchlist!",
        body
      );
    }

    if (
      otherUser?.phone &&
      otherUser?.preferences.find(
        (x) =>
          x.event === NotificationEvent["Watchlist"] &&
          x.method === NotificationMethod["SMS"]
      )?.enabled
    ) {
      await sendSms(
        `${currentUser.name} added a new item to your list! Check it out: ${baseUrl}/users/${userId}`,
        otherUser.phone
      );
    }

    await createNotification(
      userId,
      `${currentUser.name} added a new item to your list!`,
      `/users/${userId}`
    );
  }

  return json({});
};

const handleDelete = async (formData: FormData, currentUserId: number) => {
  const itemId = formData.get("itemId");

  if (!itemId) throw new Error("Must specify the item to delete");

  await deleteItem({ id: parseInt(itemId as string), userId: currentUserId });
  return json<ActionData>({ deleted: true });
};

const handleUpdateWatchStatus = async (
  formData: FormData,
  userId: number,
  currentUser: User
) => {
  if (currentUser.id === userId) {
    const itemId = formData.get("itemId");
    const status = formData.get("status");
    const score = formData.get("score");

    if (!itemId) throw new Error("Must specify the item to mark as watched");
    if (!status) throw new Error("Must specify new status");

    if ((status as WatchStatus) === WatchStatus.Watched && !score)
      throw new Error("Must specify the score when marking as watched");

    await markAsWatched(
      parseInt(itemId as string),
      status as WatchStatus,
      score ? parseInt(score as string) : undefined
    );
  }
  return json({});
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.userId, "userId not found");

  const items = await getWatchlistItems({ userId: parseInt(params.userId) });
  return json<LoaderData>({ items, userId });
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.userId, "userId not found");
  const user = await requireUser(request);
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case SEARCH_ACTION:
      return handleSearch(formData);
    case CREATE_ACTION:
      return await handleCreate(
        formData,
        parseInt(params.userId),
        user,
        new URL(request.url).origin
      );
    case DELETE_ACTION:
      return await handleDelete(formData, user.id);
    case UPDATE_WATCH_STATUS_ACTION:
      return await handleUpdateWatchStatus(
        formData,
        parseInt(params.userId),
        user
      );
    default:
      throw new Error("Invalid action.");
  }
};

export default function UserDetailsPage() {
  const { items, userId } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const pageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const transition = useTransition();

  const [hasScrolled, setHasScrolled] = useState(false);

  const CREATE_ACTION = "create";

  let isSubmitting =
    transition.submission?.formData.get("action") === CREATE_ACTION;

  useEffect(() => {
    if (actionData?.errors?.url) {
      inputRef.current?.focus();
    }
    if (!isSubmitting && !actionData?.errors) {
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }
  }, [actionData, isSubmitting]);

  const handleScroll = () => {
    if (pageRef.current?.scrollTop === 0) {
      setHasScrolled(false);
    } else {
      setHasScrolled(true);
    }
  };

  // really hacky fix for android mobile browsers which don't fire the scroll event without this crap
  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.style.overflow = "hidden";
      pageRef.current.scrollTop = 0;
      pageRef.current.style.overflow = "auto";
    }
  }, []);

  return (
    <div
      ref={pageRef}
      onScroll={handleScroll}
      className="flex-1 px-6 pt-6 pb-10"
    >
      <AddNewItemForm
        ref={inputRef}
        results={actionData?.results}
        errors={actionData?.errors}
      />
      <WatchList items={items} currentUserId={userId} />
      <Transition
        as={Fragment}
        show={hasScrolled}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-75"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-75"
        leaveTo="opacity-0"
      >
        <button
          onClick={() => {
            pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-5 right-8 ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 p-4 text-white transition ease-in-out hover:opacity-100"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      </Transition>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>User not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
