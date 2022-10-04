import { useState } from "react";
import { EyeIcon, PlusIcon } from "@heroicons/react/outline";

import AddToFriendsListModal from "~/components/AddToFriendsListModal";

export default function ListItem({
  tt,
  title,
  url,
  image,
}: {
  tt: string;
  title: string;
  url: string;
  image: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="mb-4 px-4 md:w-1/2 xl:w-1/4">
      <div className="group relative overflow-hidden">
        <img src={image} alt={title} />
        <div className="absolute bottom-0 left-0 right-0 flex translate-y-1 divide-x bg-black/90 text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            className="flex w-1/2 items-center justify-center bg-transparent py-4 transition duration-300 hover:bg-slate-800/90"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add to list
          </button>
          <a
            className="flex w-1/2 items-center justify-center bg-transparent py-4 transition duration-300 hover:bg-slate-800/90"
            target="_blank"
            rel="noreferrer"
            href={url}
          >
            <EyeIcon className="mr-2 h-5 w-5" />
            View on IMDB
          </a>
        </div>
      </div>
      <AddToFriendsListModal
        open={open}
        tt={tt}
        title={title}
        onClose={() => setOpen(false)}
      />
    </li>
  );
}
