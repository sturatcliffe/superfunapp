import { useState } from "react";
import { json, useLoaderData, Outlet, NavLink, redirect } from "remix";
import type { LoaderFunction } from "remix";

import { requireUser } from "~/services/session.server";
import { getUsers } from "~/models/user.server";

import Gravatar from "~/components/Gravatar";
import { MenuIcon } from "@heroicons/react/outline";

type LoaderData = {
  userListItems: Awaited<ReturnType<typeof getUsers>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);

  if (user && user.name == null) {
    return redirect("/profile");
  }

  const userListItems = await getUsers();

  return json<LoaderData>({
    userListItems,
  });
};

export default function UsersPage() {
  const data = useLoaderData<LoaderData>();

  const [open, setOpen] = useState(false);

  return (
    <main className="flex h-full flex-col bg-white md:flex-row">
      <div className="w-full bg-gray-50 md:w-80 md:border-r">
        <div className="flex justify-center py-2 md:hidden">
          <MenuIcon onClick={() => setOpen(!open)} className="h-6 w-6" />
        </div>
        <ol className={`${open ? "" : "hidden"} md:block`}>
          {data.userListItems.map((user) => (
            <li key={user.id}>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center border-b p-4 text-lg md:text-xl ${
                    isActive ? "bg-white" : ""
                  }`
                }
                to={`${user.id}`}
                onClick={() => setOpen(false)}
              >
                <Gravatar
                  name={user.name}
                  email={user.email}
                  className="mr-4"
                />
                {user.name}
              </NavLink>
            </li>
          ))}
        </ol>
      </div>

      <div id="users_outlet" className="flex-1 p-6 md:overflow-auto">
        <Outlet />
      </div>
    </main>
  );
}
