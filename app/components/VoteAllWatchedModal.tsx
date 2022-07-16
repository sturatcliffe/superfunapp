import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment, useRef, useState } from "react";
import { useSubmit } from "remix";
import {
  QuestionMarkCircleIcon,
  ThumbUpIcon,
  ThumbDownIcon,
} from "@heroicons/react/outline";
import { Item } from "@prisma/client";

interface Props {
  open: boolean;
  items: Item[];
  cancelHandler: () => void;
}

const ConfirmModal: FC<Props> = ({ open, items, cancelHandler }) => {
  const submit = useSubmit();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState(new Map<number, number>());
  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={titleRef}
          onClose={() => {
            cancelHandler();
          }}
        >
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
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

            {/* This element is to trick the browser into centering the modal contents. */}
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
              <div className="relative mx-4 inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:w-full md:max-w-3xl">
                <div className="sm:flex sm:items-center">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <QuestionMarkCircleIcon
                      className="h-6 w-6 text-blue-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                      ref={titleRef}
                    >
                      Pssst.....sorry to bother you!
                    </Dialog.Title>
                  </div>
                </div>
                <div className="py-4 text-gray-700">
                  <p>
                    We recently added a new feature where you are prompted to
                    vote on whether or not you enjoyed an item when you mark it
                    as watched. However, the following titles have already been
                    marked as watched in your list, so we'd appreciate if you
                    could cast your votes on these items now?
                  </p>
                  <p className="my-4">Did you enjoy the following items?</p>
                  <ul>
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="mb-8 flex flex-col items-center md:flex-row md:items-start"
                      >
                        <img
                          className="mb-4 w-40 md:mb-0 md:mr-4"
                          src={item.image}
                          alt={item.title}
                        />
                        <div className="flex flex-col">
                          <p className="mb-2 text-lg font-medium text-gray-900">
                            {item.title}
                          </p>
                          <p className="mb-4 flex-1 text-sm italic text-gray-700 md:mb-0">
                            {item.description}
                          </p>
                          <div className="mb-4 flex justify-center md:justify-start">
                            <ThumbUpIcon
                              className={`h-20 w-20 cursor-pointer ${
                                scores.get(item.id) === 1
                                  ? "fill-green-500 text-green-500"
                                  : "text-green-300 hover:text-green-500"
                              }`}
                              onClick={() =>
                                setScores((current) => {
                                  const clone = new Map(current);
                                  clone.set(item.id, 1);
                                  return clone;
                                })
                              }
                            />
                            <ThumbDownIcon
                              className={`h-20 w-20 cursor-pointer ${
                                scores.get(item.id) === -1
                                  ? "fill-red-500 text-red-500"
                                  : "text-red-300 hover:text-red-500"
                              }`}
                              onClick={() =>
                                setScores((current) => {
                                  const clone = new Map(current);
                                  clone.set(item.id, -1);
                                  return clone;
                                })
                              }
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:justify-center">
                  <button
                    className={`inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                      saving || scores.size < items.length
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    disabled={saving || scores.size < items.length}
                    onClick={() => {
                      setSaving(true);

                      const formData = new FormData();

                      scores.forEach((value, key) =>
                        formData.append(key.toString(), value.toString())
                      );

                      submit(formData, { method: "post", action: "/vote" });
                    }}
                  >
                    {saving ? "Saving..." : "Save all votes"}
                  </button>
                  <button
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => {
                      cancelHandler();
                    }}
                  >
                    Remind me later...
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default ConfirmModal;
