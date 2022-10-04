import { FC, useState } from "react";
import { Link, useFetcher } from "remix";
import { ChevronDownIcon, TrashIcon, PlusIcon } from "@heroicons/react/outline";

import type { WatchListItems } from "~/models/item.server";
import { WatchStatus } from "~/enum/WatchStatus";

import ConfirmModal from "./ConfirmModal";
import VoteModal from "./VoteModal";

interface Props {
  item: WatchListItems[number];
  currentUserId: number;
}

const WatchListItem: FC<Props> = ({ item, currentUserId }) => {
  const fetcher = useFetcher();
  const [showModal, setShowModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);

  let status =
    (fetcher.submission?.formData.get("status") as unknown as WatchStatus) ??
    item.status;

  return (
    <div className="mt-8 mb-16 flex flex-col items-center lg:my-8 lg:flex-row lg:items-stretch">
      <div className="relative mb-4 flex-shrink-0 lg:mb-0 lg:mr-4">
        <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black opacity-0 transition hover:opacity-75">
          <Link to={`?add=${item.tt}`}>
            <PlusIcon className="h-10 w-10 cursor-pointer text-white" />
          </Link>
        </div>
        <img className="w-48" alt={item.title} src={item.image} />
      </div>
      <div className="flex flex-col">
        <div className="flex">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="text-md w-full font-bold transition hover:text-slate-600 hover:underline md:text-lg"
          >
            {item.title}
          </a>
          {status.toString() === WatchStatus[WatchStatus.Unwatched] &&
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
                status.toString() == WatchStatus[WatchStatus.Watching]
                  ? "bg-yellow-400"
                  : status.toString() == WatchStatus[WatchStatus.Watched]
                  ? "bg-green-400"
                  : "bg-red-400"
              }`}
              >
                <span className="mr-1">{status}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              <ul className="absolute mb-2 hidden w-full pt-1 text-gray-700 group-hover:block">
                <fetcher.Form method="post">
                  <input type="hidden" name="itemId" value={item.id}></input>
                  <input
                    type="hidden"
                    name="action"
                    value="UpdateWatchStatus"
                  ></input>
                  {status.toString() !== WatchStatus[WatchStatus.Unwatched] && (
                    <li>
                      <button
                        className="whitespace-no-wrap block w-full rounded-t bg-gray-200 py-2 px-4 hover:bg-red-400 hover:text-white"
                        type="submit"
                        name="status"
                        value={WatchStatus[WatchStatus.Unwatched]}
                      >
                        {WatchStatus[WatchStatus.Unwatched]}
                      </button>
                    </li>
                  )}
                  {status.toString() !== WatchStatus[WatchStatus.Watching] && (
                    <li>
                      <button
                        className={`whitespace-no-wrap block w-full bg-gray-200 py-2 px-4 hover:bg-yellow-400 hover:text-white
                        ${
                          status.toString() === "Watched"
                            ? "rounded-b"
                            : "rounded-t"
                        }`}
                        type="submit"
                        name="status"
                        value={WatchStatus[WatchStatus.Watching]}
                      >
                        {WatchStatus[WatchStatus.Watching]}
                      </button>
                    </li>
                  )}
                  {status.toString() !== WatchStatus[WatchStatus.Watched] && (
                    <li>
                      <button
                        className="whitespace-no-wrap block w-full rounded-b bg-gray-200 py-2 px-4 hover:bg-green-400 hover:text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowVoteModal(true);
                        }}
                      >
                        {WatchStatus[WatchStatus.Watched]}
                      </button>
                      <VoteModal
                        open={showVoteModal}
                        confirmHandler={(score: 1 | -1) => {
                          fetcher.submit(
                            {
                              itemId: item.id.toString(),
                              action: "UpdateWatchStatus",
                              status: "Watched",
                              score: score.toString(),
                            },
                            { method: "post" }
                          );
                        }}
                        cancelHandler={() => setShowVoteModal(false)}
                      />
                    </li>
                  )}
                </fetcher.Form>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchListItem;
