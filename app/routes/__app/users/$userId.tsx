import * as React from "react";
import * as cheerio from "cheerio";
import type { LoaderFunction, ActionFunction } from "remix";
import {
  json,
  useLoaderData,
  useCatch,
  Form,
  useActionData,
  useTransition,
  redirect,
} from "remix";
import invariant from "tiny-invariant";
import {
  getWatchlistItems,
  createItem,
  markAsWatched,
} from "~/models/item.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  items: Awaited<ReturnType<typeof getWatchlistItems>>;
};

type ActionData = {
  errors?: {
    url?: string;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.userId, "userId not found");

  const items = await getWatchlistItems({ userId: params.userId as string });
  return json<LoaderData>({ items });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const url = formData.get("url") as string | undefined;
  const action = formData.get("action") as string;
  const itemId = formData.get("itemId") as string;

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

    const imdbDocument = await (await fetch(url)).text();
    const $ = cheerio.load(imdbDocument);

    const rawTitle = $("meta[property='twitter:title']").attr("content");
    const title = rawTitle?.substring(0, rawTitle.length - 7);
    const description = $("meta[property='twitter:description']").attr(
      "content"
    );
    const image = $("meta[property='twitter:image']").attr("content");

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

    await createItem({
      title,
      description,
      url,
      image,
      userId: params.userId as string,
    });
  } else {
    await markAsWatched(itemId);
  }

  return redirect(`/users/${params.userId}`);
};

export default function UserDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const urlRef = React.useRef<HTMLInputElement>(null);
  const transition = useTransition();
  const [showAll, setShowAll] = React.useState(false);

  let itemsToShow = showAll ? data.items : data.items.filter((x) => !x.watched);
  let isSubmitting = transition.state === "submitting";

  React.useEffect(() => {
    if (actionData?.errors?.url) {
      urlRef.current?.focus();
    }
    if (!isSubmitting && !actionData?.errors) {
      if (urlRef.current) {
        urlRef.current.value = "";
        urlRef.current.focus();
      }
    }
  }, [actionData, isSubmitting]);

  return (
    <>
      <Form method="post">
        <fieldset className="flex" disabled={isSubmitting}>
          <div className="w-full">
            <input
              ref={urlRef}
              name="url"
              placeholder="Enter an IMDB URL..."
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.url ? true : undefined}
              aria-errormessage={
                actionData?.errors?.url ? "url-error" : undefined
              }
            />
            {actionData?.errors?.url && (
              <div className="pt-1 text-red-700" id="url=error">
                {actionData.errors.url}
              </div>
            )}
          </div>
          <div>
            <input type="hidden" name="action" value={"create"}></input>
            <button
              type="submit"
              className={`${
                isSubmitting ? "cursor-not-allowed opacity-50 " : ""
              } ml-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400`}
            >
              {isSubmitting ? (
                <span className="flex justify-start">
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Saving...</span>
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </fieldset>
      </Form>
      {data.items.filter((x) => x.watched).length > 0 &&
        itemsToShow.length > 0 && (
          <div className="flex justify-end">
            <div className="form-check  p-4">
              <input
                className="form-check-input float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
                onChange={() => setShowAll(!showAll)}
                type="checkbox"
              />
              <label
                className="form-check-label inline-block text-gray-800"
                htmlFor="showAllx"
              >
                Include watched items
              </label>
            </div>
          </div>
        )}

      {data.items.length === 0 ? (
        <p className="mt-8">
          There is nothing in your watchlist. Add something using the form
          above.
        </p>
      ) : (
        itemsToShow.map((item) => (
          <Form method="post" key={item.id}>
            <div className="mt-8 flex">
              <div className="mr-4 flex-shrink-0">
                <img className="w-48" alt={item.title} src={item.image} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-lg font-bold">{item.title}</h4>
                <p className="mt-1 flex-1">{item.description}</p>
                <div className=" self-end">
                  <input type="hidden" name="itemId" value={item.id}></input>
                  <button
                    type="submit"
                    className={`${
                      item.watched
                        ? "cursor-not-allowed bg-green-600 opacity-60"
                        : "bg-pink-600"
                    } mt-auto block self-end justify-self-end rounded-full py-1 px-2 text-sm text-white`}
                    disabled={item.watched!}
                  >
                    {item.watched ? "Watched" : "Mark as Watched"}
                  </button>
                </div>
              </div>
              <input
                type="hidden"
                name="action"
                value={"markAsWatched"}
              ></input>
            </div>
          </Form>
        ))
      )}
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
