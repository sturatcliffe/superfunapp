import { useEffect, useRef, useState } from "react";
import { NotificationEvent, NotificationMethod } from "@prisma/client";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useActionData,
  useLoaderData,
} from "remix";
import { boolean, InferType, object, string } from "yup";
import { validateFormData } from "~/utils";
import { phone as parsePhone } from "phone";
import { Popover } from "@headlessui/react";

import { requireUser, requireUserId } from "~/services/session.server";
import { updateProfile } from "~/models/user.server";

interface ActionData {
  errors?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface LoaderData {
  user: Awaited<ReturnType<typeof requireUser>>;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  return json<LoaderData>({ user });
};

const schema = object({
  name: string().required().min(2),
  email: string().required().email(),
  phone: string().test((value: string | undefined) => {
    return value?.length ? parsePhone(value).isValid : true;
  }),
  watchlistEmail: boolean().default(false),
  chatEmail: boolean().default(false),
  usersEmail: boolean().default(false),
  watchlistSms: boolean().default(false),
  chatSms: boolean().default(false),
  usersSms: boolean().default(false),
  watchlistPush: boolean().default(false),
  chatPush: boolean().default(false),
  usersPush: boolean().default(false),
});

type Profile = InferType<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const { data, errors } = await validateFormData<Profile>(formData, schema);

  if (errors) {
    return json<ActionData>({ errors }, { status: 400 });
  }

  let {
    name,
    email,
    phone,
    watchlistEmail,
    chatEmail,
    usersEmail,
    watchlistSms,
    chatSms,
    usersSms,
    watchlistPush,
    chatPush,
    usersPush,
  } = data;

  if (!phone) {
    watchlistSms = false;
    chatSms = false;
    usersSms = false;
  }

  await updateProfile(
    userId,
    name,
    email,
    phone ? parsePhone(phone).phoneNumber : null,
    watchlistEmail,
    chatEmail,
    usersEmail,
    watchlistSms,
    chatSms,
    usersSms,
    watchlistPush,
    chatPush,
    usersPush
  );

  return json({});
};

export default function ProfilePage() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData() as ActionData;
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState(actionData?.errors);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setErrors(actionData?.errors);

    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.phone) {
      phoneRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      className="mx-auto max-w-5xl space-y-6 divide-y divide-gray-200 px-4 pb-4"
    >
      <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Personal Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Don't worry, we'll never share this information with anyone.
          </p>
        </div>
        <div className="space-y-6 sm:space-y-5">
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label
              htmlFor="first-name"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Name
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                ref={nameRef}
                type="text"
                name="name"
                id="name"
                autoComplete="name"
                className={`block w-full max-w-lg rounded-md shadow-sm sm:max-w-xs sm:text-sm ${
                  errors?.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                defaultValue={user.name ?? undefined}
              />
              {errors?.name && (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Email address
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`block w-full max-w-lg rounded-md shadow-sm sm:text-sm ${
                  errors?.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                defaultValue={user.email}
              />
              {errors?.email && (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Phone number
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                ref={phoneRef}
                id="phone"
                name="phone"
                type="text"
                autoComplete="phone"
                className={`block w-full max-w-lg rounded-md shadow-sm sm:text-sm ${
                  errors?.phone
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : popoverOpen
                    ? "border-orange-500 bg-orange-100 focus:border-orange-500 focus:ring-orange-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                defaultValue={user.phone ?? undefined}
              />
              {errors?.phone && (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 divide-y divide-gray-200 pt-8 sm:space-y-5 sm:pt-10">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Notifications
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            You'll always receive notifications in the top right-hand corner of
            your screen, but choose how else you want to receive notifications
            from us.
          </p>
        </div>
        <div className="space-y-6 divide-y divide-gray-200 sm:space-y-5">
          <div className="pt-6 sm:pt-5">
            <div role="group" aria-labelledby="label-email">
              <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                <div>
                  <div
                    className="text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700"
                    id="label-email"
                  >
                    By Email
                  </div>
                </div>
                <div className="mt-4 sm:col-span-2 sm:mt-0">
                  <div className="max-w-lg space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="watchlistEmail"
                          name="watchlistEmail"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          value="true"
                          defaultChecked={
                            user.preferences.find(
                              (x) =>
                                x.method === NotificationMethod["Email"] &&
                                x.event === NotificationEvent["Watchlist"]
                            )?.enabled ?? false
                          }
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="watchlistEmail"
                          className="font-medium text-gray-700"
                        >
                          Watch list
                        </label>
                        <p className="text-gray-500">
                          Get notified when someone adds a new item to your
                          watch list.
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="chatEmail"
                            name="chatEmail"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            value="true"
                            defaultChecked={
                              user.preferences.find(
                                (x) =>
                                  x.method === NotificationMethod["Email"] &&
                                  x.event === NotificationEvent["Chat"]
                              )?.enabled ?? false
                            }
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="chatEmail"
                            className="font-medium text-gray-700"
                          >
                            Chat
                          </label>
                          <p className="text-gray-500">
                            Get notified when a new chat message is posted.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="usersEmail"
                            name="usersEmail"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            value="true"
                            defaultChecked={
                              user.preferences.find(
                                (x) =>
                                  x.method === NotificationMethod["Email"] &&
                                  x.event === NotificationEvent["Users"]
                              )?.enabled ?? false
                            }
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="usersEmail"
                            className="font-medium text-gray-700"
                          >
                            Users
                          </label>
                          <p className="text-gray-500">
                            Get notified when a new user signs up for
                            SuperFunApp!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Popover
            as="div"
            className="relative pt-6 sm:pt-5"
            onMouseEnter={() => {
              if (!user.phone) {
                setPopoverOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (!user.phone) {
                setPopoverOpen(false);
              }
            }}
          >
            {popoverOpen && (
              <Popover.Panel
                static
                as="div"
                className="absolute top-1 right-0 rounded-md bg-orange-100 px-2 py-1 text-orange-500 opacity-75"
              >
                Phone number required
              </Popover.Panel>
            )}
            <div
              role="group"
              aria-labelledby="label-notifications"
              className={`${
                !user.phone ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                <div>
                  <div
                    className="text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700"
                    id="label-notifications"
                  >
                    By SMS
                  </div>
                </div>
                <div className="mt-4 sm:col-span-2 sm:mt-0">
                  <div className="max-w-lg space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="watchlistSms"
                          name="watchlistSms"
                          type="checkbox"
                          className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
                            !user.phone ? "cursor-not-allowed" : ""
                          }`}
                          value="true"
                          disabled={!user.phone}
                          defaultChecked={
                            user.preferences.find(
                              (x) =>
                                x.method === NotificationMethod["SMS"] &&
                                x.event === NotificationEvent["Watchlist"]
                            )?.enabled ?? false
                          }
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="watchlistSms"
                          className={`font-medium text-gray-700 ${
                            !user.phone ? "cursor-not-allowed" : ""
                          }`}
                        >
                          Watch list
                        </label>
                        <p className="text-gray-500">
                          Get notified when someone adds a new item to your
                          watch list.
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="chatSms"
                            name="chatSms"
                            type="checkbox"
                            className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
                              !user.phone ? "cursor-not-allowed" : ""
                            }`}
                            value="true"
                            disabled={!user.phone}
                            defaultChecked={
                              user.preferences.find(
                                (x) =>
                                  x.method === NotificationMethod["SMS"] &&
                                  x.event === NotificationEvent["Chat"]
                              )?.enabled ?? false
                            }
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="chatSms"
                            className={`font-medium text-gray-700 ${
                              !user.phone ? "cursor-not-allowed" : ""
                            }`}
                          >
                            Chat
                          </label>
                          <p className="text-gray-500">
                            Get notified when a new chat message is posted.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="usersSms"
                            name="usersSms"
                            type="checkbox"
                            className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
                              !user.phone ? "cursor-not-allowed" : ""
                            }`}
                            value="true"
                            disabled={!user.phone}
                            defaultChecked={
                              user.preferences.find(
                                (x) =>
                                  x.method === NotificationMethod["SMS"] &&
                                  x.event === NotificationEvent["Users"]
                              )?.enabled ?? false
                            }
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="usersSms"
                            className={`font-medium text-gray-700 ${
                              !user.phone ? "cursor-not-allowed" : ""
                            }`}
                          >
                            Users
                          </label>
                          <p className="text-gray-500">
                            Get notified when a new user signs up for
                            SuperFunApp!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Popover>
          <div className="pt-6 sm:pt-5">
            <div role="group" aria-labelledby="label-email">
              <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                <div>
                  <div
                    className="text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700"
                    id="label-email"
                  >
                    Push
                  </div>
                </div>
                <div className="mt-4 sm:col-span-2 sm:mt-0">
                  {typeof window !== "undefined" &&
                  Notification.permission === "granted" ? (
                    <div className="max-w-lg space-y-4">
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="watchlistPush"
                            name="watchlistPush"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            value="true"
                            defaultChecked={
                              user.preferences.find(
                                (x) =>
                                  x.method === NotificationMethod["Push"] &&
                                  x.event === NotificationEvent["Watchlist"]
                              )?.enabled ?? false
                            }
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="watchlistPush"
                            className="font-medium text-gray-700"
                          >
                            Watch list
                          </label>
                          <p className="text-gray-500">
                            Get notified when someone adds a new item to your
                            watch list.
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="relative flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="chatPush"
                              name="chatPush"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              value="true"
                              defaultChecked={
                                user.preferences.find(
                                  (x) =>
                                    x.method === NotificationMethod["Push"] &&
                                    x.event === NotificationEvent["Chat"]
                                )?.enabled ?? false
                              }
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="chatPush"
                              className="font-medium text-gray-700"
                            >
                              Chat
                            </label>
                            <p className="text-gray-500">
                              Get notified when a new chat message is posted.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="relative flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="usersPush"
                              name="usersPush"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              value="true"
                              defaultChecked={
                                user.preferences.find(
                                  (x) =>
                                    x.method === NotificationMethod["Push"] &&
                                    x.event === NotificationEvent["Users"]
                                )?.enabled ?? false
                              }
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="usersPush"
                              className="font-medium text-gray-700"
                            >
                              Users
                            </label>
                            <p className="text-gray-500">
                              Get notified when a new user signs up for
                              SuperFunApp!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => Notification.requestPermission()}>
                      Enable Push Notifications
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="reset"
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => setErrors(undefined)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </Form>
  );
}
