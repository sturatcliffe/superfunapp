import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { LoaderFunction, ActionFunction, useTransition } from "remix";
import { json, useLoaderData, useCatch, useActionData } from "remix";
import invariant from "tiny-invariant";

import {
  getWatchlistItems,
  upsertItem,
  markAsWatched,
  deleteItem,
} from "~/models/item.server";
import { getUserById } from "~/models/user.server";

import { requireUser, requireUserId } from "~/services/session.server";
import { sendMail } from "~/services/email.server";

import WatchList from "~/components/WatchList";
import type { Fields } from "~/components/AddNewItemForm";
import AddNewItemForm from "~/components/AddNewItemForm";
import { scrapeImdbData } from "~/services/imdb.server";

type LoaderData = {
  items: Awaited<ReturnType<typeof getWatchlistItems>>;
  userId: number;
};

type ActionData = {
  errors?: Fields;
  deleted?: boolean;
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
  const url = formData.get("url") as string | undefined;
  const action = formData.get("action") as string;
  const itemId = formData.get("itemId") as string;
  const userId = await requireUserId(request);

  const MARK_AS_WATCHED_ACTION = "markAsWatched";
  if (action === "create") {
    if (
      typeof url !== "string" ||
      !url.startsWith("https://www.imdb.com/title/")
    ) {
      return json<ActionData>(
        { errors: { url: "You must enter a valid IMDB URL" } },
        { status: 400 }
      );
    }

    const { title, description, image } = await scrapeImdbData(url);

    if (
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
      title,
      description,
      url,
      image,
      userId: parseInt(params.userId),
      createdById: user.id,
    });

    if (user.id != parseInt(params.userId)) {
      const otherUser = await getUserById(parseInt(params.userId));
      if (otherUser) {
        const body = `
          <p>Hello${otherUser.name ? ` ${otherUser.name}` : ""},</p>
          <p>${
            user.name ?? user.email
          } has just added <b>${title}</b> to your watchlist!</p>
          <p>Toodles!</p>
        `;

        await sendMail(
          otherUser.name ?? otherUser.email,
          otherUser.email,
          "SuperFunApp: A new item has been added to your watchlist!",
          body
        );
      }
    }
  } else if (action === "delete") {
    await deleteItem({ id: parseInt(itemId), userId });
    return json<ActionData>({ deleted: true });
  } else if (
    action === MARK_AS_WATCHED_ACTION &&
    user.id === parseInt(params.userId)
  ) {
    await markAsWatched(parseInt(itemId));
  }

  return json({});
};

export default function UserDetailsPage() {
  const { items, userId } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const inputRef = useRef<HTMLInputElement>(null);
  const transition = useTransition();

  const [isMainFormVisible, setIsMainFormVisible] = useState(true);

  const CREATE_ACTION = "create";

  let isSubmitting =
    transition.submission?.formData.get("action") === CREATE_ACTION;

  let usersOutletElem: HTMLElement | null;

  if (typeof window !== "undefined") {
    usersOutletElem = document.getElementById("users_outlet");

    const observer = useMemo(
      () =>
        new IntersectionObserver(([entry]) => {
          setIsMainFormVisible(entry.isIntersecting);
        }),
      []
    );

    useEffect(() => {
      if (inputRef.current) {
        observer.observe(inputRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, [inputRef, observer]);
  }

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

  useEffect(() => {
    const focusInput = () => {
      if (usersOutletElem?.scrollTop === 0) {
        inputRef.current?.focus();
      }
    };

    usersOutletElem?.addEventListener("scroll", focusInput);

    return () => usersOutletElem?.removeEventListener("scroll", focusInput);
  }, []);

  return (
    <div className="pb-4">
      <AddNewItemForm ref={inputRef} errors={actionData?.errors} />
      <WatchList items={items} currentUserId={userId} />
      <Transition
        as={Fragment}
        show={!isMainFormVisible}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <button
          onClick={() =>
            usersOutletElem?.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-5 right-8 ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 p-4 text-white"
        >
          +
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
