import { FC, useState } from "react";
import { Form, useTransition } from "remix";
import { TrashIcon } from "@heroicons/react/outline";

import type { WatchListItems } from "~/models/item.server";
import ConfirmModal from "./ConfirmModal";

interface Props {
  item: WatchListItems[number];
  currentUserId: string;
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
    <div className="mt-8 mb-8 flex">
      <div className="mr-4 flex-shrink-0">
        <img className="w-48" alt={item.title} src={item.image} />
      </div>
      <div className="flex flex-col">
        <div className="flex w-full">
          <a
            href={item.url}
            target="_blank"
            className="w-full text-lg font-bold transition hover:text-slate-600 hover:underline"
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
              ></ConfirmModal>
            </div>
          )}
        </div>
        <p className="mt-1 flex-1">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm italic text-gray-700">
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
              } mt-auto block rounded-full py-1 px-2 text-sm text-white`}
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
