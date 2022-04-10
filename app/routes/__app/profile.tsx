import React from "react";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useSearchParams,
} from "remix";
import { updateUserName } from "~/models/user.server";
import { getUser, getUserId } from "~/services/session.server";

interface ActionData {
  errors?: {
    name?: string;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (user && user.name != null) {
    return redirect("/users");
  }
  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const redirectTo = formData.get("redirectTo") as string;
  const userId = (await getUserId(request)) as string;

  if (typeof name !== "string") {
    return json<ActionData>(
      { errors: { name: "Username is required" } },
      { status: 400 }
    );
  }

  await updateUserName(userId, name);

  return redirect(redirectTo);
};

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData() as ActionData;
  const nameRef = React.useRef<HTMLInputElement>(null);
  const redirectTo = searchParams.get("redirectTo") || "/users";

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div>
      <div className="flex justify-center text-xl font-bold">
        <h1>User Information</h1>
      </div>
      <div className="flex min-h-full w-1/4 flex-col px-5">
        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              User Name
            </label>
            <div className="mt-1">
              <input
                ref={nameRef}
                id="name"
                required
                autoFocus={true}
                name="name"
                type="Text"
                autoComplete="username"
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.name && (
                <div className="pt-1 text-red-700" id="name-error">
                  {actionData.errors.name}
                </div>
              )}
            </div>
          </div>
          <div className="float-right">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Save
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
