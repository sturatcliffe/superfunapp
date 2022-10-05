import { useState } from "react";
import { ActionFunction, json, LoaderFunction, useLoaderData } from "remix";
import { formAction } from "remix-forms";
import { Popover } from "@headlessui/react";

import { requireUser, requireUserId } from "~/services/session.server";

import { mutation, schema } from "~/domain/user/commands/updateProfile";

import Button from "~/components/shared/Button";
import Form from "~/components/shared/Form";

interface LoaderData {
  user: Awaited<ReturnType<typeof requireUser>>;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  return json<LoaderData>({ user });
};

export const action: ActionFunction = async ({ request }) => {
  return formAction({
    request,
    schema,
    mutation,
    environment: {
      id: await requireUserId(request),
    },
  });
};

export default function ProfilePage() {
  const { user } = useLoaderData<LoaderData>();
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4">
      <Form schema={schema} values={user}>
        {({ Field }) => (
          <>
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
                <Field
                  name="name"
                  className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5"
                >
                  {({ Label, SmartInput, Error }) => (
                    <>
                      <Label className="text-gray-700 sm:mt-px sm:pt-2">
                        Name
                      </Label>
                      <SmartInput />
                      <Error />
                    </>
                  )}
                </Field>

                <Field
                  name="email"
                  className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5"
                >
                  {({ Label, SmartInput, Error }) => (
                    <>
                      <Label className="text-gray-700 sm:mt-px sm:pt-2">
                        Email address
                      </Label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <div className="w-full max-w-lg">
                          <SmartInput />
                          <Error />
                        </div>
                      </div>
                    </>
                  )}
                </Field>

                <Field
                  name="phone"
                  className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5"
                >
                  {({ Label, SmartInput, Error }) => (
                    <>
                      <Label className="text-gray-700 sm:mt-px sm:pt-2">
                        Phone number
                      </Label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <div className="w-full max-w-lg">
                          <SmartInput />
                          <Error />
                        </div>
                      </div>
                    </>
                  )}
                </Field>
              </div>
            </div>

            <div className="space-y-6 divide-y divide-gray-200 pt-8 sm:space-y-5 sm:pt-10">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Notifications
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  You'll always receive notifications in the top right-hand
                  corner of your screen, but choose how else you want to receive
                  notifications from us.
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
                        <div className="relative max-w-lg space-y-4">
                          <div className="relative flex items-start">
                            <Field name="watchlistEmail" label="Watch list" />
                          </div>
                          <div className="relative flex items-start">
                            <Field name="chatEmail" label="Chat" />
                          </div>
                          <div className="relative flex items-start">
                            <Field name="usersEmail" label="Users" />
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
                            <Field name="watchlistSms" label="Watch list" />
                          </div>
                          <div className="relative flex items-start">
                            <Field name="chatSms" label="Chat" />
                          </div>
                          <div className="relative flex items-start">
                            <Field name="usersSms" label="Users" />
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
                              <Field name="watchlistPush" label="Watch list" />
                            </div>
                            <div>
                              <div className="relative flex items-start">
                                <Field name="chatPush" label="Chat" />
                              </div>
                            </div>
                            <div>
                              <div className="relative flex items-start">
                                <Field name="usersPush" label="Users" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => Notification.requestPermission()}
                          >
                            Enable Push Notifications
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-5">
                  <div className="flex justify-end">
                    <Button
                      type="reset"
                      variant="secondary"
                      onClick={() =>
                        console.log(
                          "This needs to clear the error state and reset the form"
                        )
                      }
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="ml-3">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
