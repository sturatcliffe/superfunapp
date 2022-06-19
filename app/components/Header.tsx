import { useEffect, useState } from "react";
import { Link, Form, useLocation } from "remix";
import { LogoutIcon } from "@heroicons/react/outline";
import Pusher from "pusher-js";

import { useMatchesData, useUser } from "~/utils";

export default function Header() {
  const user = useUser();
  const data = useMatchesData("root");
  let location = useLocation();

  const [hasUnreadMessages, setHasUnreadMessages] = useState(
    (data?.unreadMessageCount as number) > 0 ?? false
  );

  useEffect(() => {
    // @ts-ignore
    const pusher = new Pusher(window?.ENV.PUSHER_APP_KEY, {
      cluster: "eu",
      forceTLS: true,
    });

    const channel = pusher.subscribe("chat");

    channel.bind("message", (data: any) => {
      if (window?.location.pathname !== "/chat" ?? false) {
        setHasUnreadMessages(true);
      }
    });
  }, []);

  useEffect(() => {
    if (location.pathname === "/chat" ?? false) {
      setHasUnreadMessages(false);
    }
  }, [location]);

  return (
    <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
      <h1 className="text-md font-bold md:text-3xl">
        <Link to={`/users/${user.id}`}>SuperFunApp</Link>
      </h1>
      <Link to="/profile" className="text-sm md:text-base">
        {user.email}
      </Link>
      <div className="flex items-center">
        <Link to="/chat" className="relative text-sm md:text-base">
          Chat{" "}
          {hasUnreadMessages && (
            <span className="absolute -top-1 -right-2 flex h-1 w-1 md:h-2 md:w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-1 w-1 rounded-full bg-red-500 md:h-2 md:w-2"></span>
            </span>
          )}
        </Link>
        <Form action="/logout" method="post" className="ml-4">
          <button
            type="submit"
            className="flex items-center rounded bg-slate-600 p-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600 md:py-2 md:px-4"
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden md:ml-2 md:inline">Logout</span>
          </button>
        </Form>
      </div>
    </header>
  );
}
