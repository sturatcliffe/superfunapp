import { FC, useState } from "react";
import { Form, useTransition } from "remix";
import {
  ArrowDownIcon,
  ChevronDownIcon,
  TrashIcon,
} from "@heroicons/react/outline";

import type { WatchListItems } from "~/models/item.server";
import ConfirmModal from "./ConfirmModal";
import { WatchStatus } from "~/enum/WatchStatus";
import { UPDATE_WATCH_STATUS_ACTION } from "~/routes/__app/users/$userId";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  item: WatchListItems[number];
  currentUserId: number;
}

const WatchListItem: FC<Props> = ({ item, currentUserId }) => {
  const transition = useTransition();
  const [showModal, setShowModal] = useState(false);

  let isSubmitting =
    transition.submission?.formData.get("action") ===
      UPDATE_WATCH_STATUS_ACTION &&
    parseInt(
      (transition.submission?.formData.get("itemId") as string) ?? "0"
    ) === item.id;

  return (
    <div className="mt-8 mb-16 flex flex-col items-center lg:my-8 lg:flex-row lg:items-stretch">
      <div className="mb-4 flex-shrink-0 lg:mb-0 lg:mr-4">
        <img className="w-48" alt={item.title} src={item.image} />
      </div>
      <div className="flex flex-col">
        <div className="flex">
          <a
            href={item.url}
            target="_blank"
            className="text-md w-full font-bold transition hover:text-slate-600 hover:underline md:text-lg"
          >
            {item.title}
          </a>
          {item.status.toString() === WatchStatus[WatchStatus.Unwatched] &&
            item.userId == currentUserId && (
              <div className="flex justify-end">
                <TrashIcon
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => setShowModal(true)}
                />
                <ConfirmModal
                  open={showModal}
                  title="Are you sure?"
                  confirmText="Yes"
                  rejectText="No"
                  itemId={item.id}
                  cancelHandler={() => setShowModal(false)}
                  action="delete"
                ></ConfirmModal>
              </div>
            )}
        </div>
        <p className="mt-4 flex-1 text-sm md:text-base lg:mt-1">
          {item.description}
        </p>
        <div className="mt-4 flex items-center justify-between lg:mt-0">
          <span className="text-xs italic text-gray-700 md:text-sm">
            Added by:{" "}
            <span className="font-semibold">
              {item.createdBy.id === currentUserId
                ? "You"
                : item.createdBy.name}
            </span>
          </span>

          <input type="hidden" name="itemId" value={item.id}></input>
          <div className="flex">
            <div className="group relative inline-block">
              <button
                className={`inline-flex items-center rounded py-2 px-4 font-semibold text-white
              ${
                item.status.toString() == WatchStatus[WatchStatus.Watching]
                  ? "bg-yellow-400"
                  : item.status.toString() == WatchStatus[WatchStatus.Watched]
                  ? "bg-green-400"
                  : "bg-red-400"
              }`}
              >
                {isSubmitting && <LoadingSpinner className="mr-2 h-4 w-4" />}
                <span className="mr-1">{item.status}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              <ul className="absolute mb-2 hidden w-full pt-1 text-gray-700 group-hover:block">
                <Form method="post">
                  <input type="hidden" name="itemId" value={item.id}></input>
                  <input
                    type="hidden"
                    name="action"
                    value="UpdateWatchStatus"
                  ></input>
                  {item.status.toString() !==
                    WatchStatus[WatchStatus.Unwatched] && (
                    <li>
                      <button
                        className={`whitespace-no-wrap block w-full rounded-t bg-gray-200 py-2 px-4 hover:bg-red-400 hover:text-white
                        ${isSubmitting ? "cursor-not-allowed" : ""}`}
                        type="submit"
                        name="status"
                        value={WatchStatus[WatchStatus.Unwatched]}
                        disabled={isSubmitting}
                      >
                        {WatchStatus[WatchStatus.Unwatched]}
                      </button>
                    </li>
                  )}
                  {item.status.toString() !==
                    WatchStatus[WatchStatus.Watching] && (
                    <li>
                      <button
                        className={`whitespace-no-wrap block w-full bg-gray-200 py-2 px-4 hover:bg-yellow-400 hover:text-white
                        ${isSubmitting ? "cursor-not-allowed" : ""} ${
                          item.status.toString() === "Watched"
                            ? "rounded-b"
                            : "rounded-t"
                        }`}
                        type="submit"
                        name="status"
                        value={WatchStatus[WatchStatus.Watching]}
                        disabled={isSubmitting}
                      >
                        {WatchStatus[WatchStatus.Watching]}
                      </button>
                    </li>
                  )}
                  {item.status.toString() !==
                    WatchStatus[WatchStatus.Watched] && (
                    <li>
                      <button
                        className={`whitespace-no-wrap block w-full rounded-b bg-gray-200 py-2 px-4 hover:bg-green-400 hover:text-white 
                        ${isSubmitting ? "cursor-not-allowed" : ""}`}
                        type="submit"
                        name="status"
                        value={WatchStatus[WatchStatus.Watched]}
                        disabled={isSubmitting}
                      >
                        {WatchStatus[WatchStatus.Watched]}
                      </button>
                    </li>
                  )}
                </Form>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchListItem;
