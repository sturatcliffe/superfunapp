import * as React from "react";
import type { LoaderFunction, ActionFunction } from "remix";
import { redirect } from "remix";
import { json, useLoaderData, useCatch, Form, useActionData } from "remix";
import invariant from "tiny-invariant";
import { getWatchlistItems } from "~/models/item.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  items: Awaited<ReturnType<typeof getWatchlistItems>>;
};

type ActionData = {
  data?: object;
  errors?: {
    url?: string;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.userId, "userId not found");

  const items = await getWatchlistItems({ userId });
  return json<LoaderData>({ items });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
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

  const imdbDocument = await (await fetch(url)).text();

  console.log("IMDB: ", imdbDocument);

  return json<ActionData>({ data: { imdbDocument } });

  //const note = await createItem({ title, body, userId });

  return redirect(`/users`);
};

export default function UserDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const urlRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.url) {
      urlRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <Form method="post" className="flex">
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

        <button
          type="submit"
          className="ml-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </Form>
      <pre className="mt-4">{JSON.stringify(actionData, null, 3)}</pre>
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
