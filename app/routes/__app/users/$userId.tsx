import type { LoaderFunction, ActionFunction } from "remix";
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
  userId: string;
};

type ActionData = {
  errors?: Fields;
  deleted?: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.userId, "userId not found");

  const items = await getWatchlistItems({ userId: params.userId });
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
      userId: params.userId as string,
      createdById: user.id,
    });

    if (user.id != params.userId) {
      const otherUser = await getUserById(params.userId);
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
    await deleteItem({ id: itemId, userId });
    return json<ActionData>({ deleted: true });
  } else if (action === MARK_AS_WATCHED_ACTION && user.id === params.userId) {
    await markAsWatched(itemId);
  }

  return json({});
};

export default function UserDetailsPage() {
  const { items, userId } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="pb-4">
      <AddNewItemForm errors={actionData?.errors} />
      <WatchList items={items} currentUserId={userId} />
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
