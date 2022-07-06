import { WatchStatus } from "@prisma/client";
import { FC, useState } from "react";

import type { WatchListItems } from "~/models/item.server";

import WatchListItem from "./WatchListItem";

interface Props {
  items: WatchListItems;
  currentUserId: number;
}

const WatchList: FC<Props> = ({ items, currentUserId }) => {
  const [showAll, setShowAll] = useState(false);

  let hasWatchedItems = items.some((x) => x.status === WatchStatus.Watched);
  let itemsToShow = showAll
    ? items
    : items.filter((x) => x.status != WatchStatus.Watched);

  return (
    <>
      {hasWatchedItems && (
        <div className="flex justify-end">
          <div className="form-check flex items-center p-4">
            <input
              className="form-check-input float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
              checked={showAll}
              onChange={() => setShowAll(!showAll)}
              type="checkbox"
            />
            <label
              className="form-check-label inline-block text-sm text-gray-800 md:text-base"
              htmlFor="showAll"
            >
              Include watched items
            </label>
          </div>
        </div>
      )}

      {itemsToShow.length === 0 ? (
        <p className="mt-8">
          There is nothing in your watchlist. Add something using the form
          above.
        </p>
      ) : (
        itemsToShow.map((item) => (
          <WatchListItem
            key={item.id}
            item={item}
            currentUserId={currentUserId}
          />
        ))
      )}
    </>
  );
};

export default WatchList;
