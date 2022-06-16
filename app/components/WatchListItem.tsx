import { FC, useState } from "react";
import { Form, useTransition } from "remix";
import { TrashIcon } from "@heroicons/react/outline";

import type { WatchListItems } from "~/models/item.server";
import ConfirmModal from "./ConfirmModal";

interface Props {
  item: WatchListItems[number];
  currentUserId: number;
}

const MARK_AS_WATCHED_ACTION = "markAsWatched";

const WatchListItem: FC<Props> = ({ item, currentUserId }) => {
  const transition = useTransition();
  const [showModal, setShowModal] = useState(false);

  let isSubmitting =
    transition.submission?.formData.get("action") === MARK_AS_WATCHED_ACTION;

  let markAsWatchedDisabled =
    isSubmitting || item.watched || item.userId != currentUserId;

  return (
    <div className="mt-8 mb-16 flex flex-col items-center md:my-8 md:flex-row md:items-stretch">
      <div className="mb-4 flex-shrink-0 md:mb-0 md:mr-4">
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
          {!item.watched && item.userId == currentUserId && (
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
        <p className="mt-4 flex-1 text-sm md:mt-1 md:text-base">
          {item.description}
        </p>
        <div className="mt-4 flex items-center justify-between md:mt-0">
          <span className="text-xs italic text-gray-700 md:text-sm">
            Added by:{" "}
            <span className="font-semibold">
              {item.createdBy.id === currentUserId
                ? "You"
                : item.createdBy.name}
            </span>
          </span>

          <Form method="post">
            <input type="hidden" name="itemId" value={item.id}></input>
            <input
              type="hidden"
              name="action"
              value={MARK_AS_WATCHED_ACTION}
            ></input>
            <button
              type="submit"
              className={`${item.watched ? "bg-green-600" : "bg-pink-600"} ${
                markAsWatchedDisabled ? "cursor-not-allowed opacity-60" : ""
              } mt-auto block rounded-full py-1 px-2 text-xs text-white md:text-sm`}
              disabled={markAsWatchedDisabled}
            >
              {item.watched ? "Watched" : "Mark as Watched"}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default WatchListItem;
