import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment, useState } from "react";
import {
  QuestionMarkCircleIcon,
  ThumbUpIcon,
  ThumbDownIcon,
} from "@heroicons/react/outline";

interface Props {
  open: boolean;
  confirmHandler: (score: 1 | -1) => void;
  cancelHandler: () => void;
}

const ConfirmModal: FC<Props> = ({ open, confirmHandler, cancelHandler }) => {
  const [score, setScore] = useState<1 | -1 | undefined>(undefined);

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {
            cancelHandler();
            setScore(undefined);
          }}
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
              <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle">
                <div className="justify-center sm:flex sm:items-center">
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
                    >
                      What did you think?
                    </Dialog.Title>
                  </div>
                </div>
                <div className="flex justify-center py-4">
                  <ThumbUpIcon
                    className={`h-20 w-20 cursor-pointer ${
                      score === 1
                        ? "text-green-500"
                        : "text-gray-700 opacity-50"
                    }`}
                    onClick={() => setScore(1)}
                  />
                  <ThumbDownIcon
                    className={`h-20 w-20 cursor-pointer ${
                      score === -1 ? "text-red-500" : "text-gray-700 opacity-50"
                    }`}
                    onClick={() => setScore(-1)}
                  />
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:justify-center">
                  <button
                    className={`inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                      typeof score === "undefined"
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    disabled={typeof score === "undefined"}
                    onClick={() => {
                      if (typeof score !== "undefined") {
                        confirmHandler(score);
                      }
                    }}
                  >
                    Vote
                  </button>
                  <button
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => {
                      cancelHandler();
                      setScore(undefined);
                    }}
                  >
                    Cancel
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
