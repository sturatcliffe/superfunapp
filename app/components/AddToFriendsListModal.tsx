import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment, useEffect } from "react";
import { useFetcher } from "remix";
import { PlusIcon } from "@heroicons/react/outline";

import Gravatar from "./Gravatar";
import LoadingSpinner from "./LoadingSpinner";

interface props {
  open: boolean;
  tt: string;
  title: string;
  onClose: () => void;
}

const AddToFriendsListModal: FC<props> = ({ open, tt, title, onClose }) => {
  const addToList = useFetcher();
  const users = useFetcher();

  const submitting = addToList.state === "submitting";
  const loading = users.state === "loading";

  useEffect(() => {
    if (open && users.type === "init") {
      users.load(`/api/users?unwatched=${tt}`);
    }

    if (addToList.state === "submitting") {
      users.load(`/api/users?unwatched=${tt}`);
      onClose();
    }
  }, [open, users, addToList, onClose, tt]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        open={open}
        onClose={onClose}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          {/* This element is to trick the browser into centering the modal
          contents. */}
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <PlusIcon
                    className="h-6 w-6 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Who do you want to watch:{" "}
                    <span className="font-normal italic">{title}</span>?
                  </Dialog.Title>
                </div>
              </div>
              <div className="mt-5 sm:mt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner className="h-10 w-10 text-blue-900" />
                  </div>
                ) : (
                  <addToList.Form method="post" action="/api/users">
                    <input type="hidden" name="tt" value={tt} />
                    <ul className="my-8 divide-y divide-gray-200">
                      {users.data?.length > 0 ? (
                        users.data.map((user: any) => (
                          <li key={user.id}>
                            <label className="flex cursor-pointer items-center py-4">
                              <Gravatar size={30} email={user.email} />
                              <div className="ml-3 mr-auto">
                                <p className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </p>
                              </div>
                              <input
                                name="users"
                                type="checkbox"
                                value={user.id}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </label>
                          </li>
                        ))
                      ) : (
                        <li>All of your friends have watched this title!</li>
                      )}
                    </ul>
                    <div className="flex flex-row-reverse">
                      <button
                        type="submit"
                        className={`inline-flex justify-center whitespace-nowrap rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2${
                          submitting ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <LoadingSpinner className="mr-2 h-5 w-5" />
                        ) : (
                          <PlusIcon className="mr-2 h-5 w-5" />
                        )}
                        {submitting ? "Adding..." : "Add to lists"}
                      </button>
                      <button
                        onClick={onClose}
                        className="mr-2 inline-flex justify-center rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </addToList.Form>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AddToFriendsListModal;
