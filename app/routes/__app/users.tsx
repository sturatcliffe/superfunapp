import { useState } from "react";
import { json, useLoaderData, Outlet, NavLink, redirect } from "remix";
import type { LoaderFunction } from "remix";

import { requireUser } from "~/services/session.server";
import { getUsers } from "~/models/user.server";

import Gravatar from "~/components/Gravatar";
import { MenuIcon } from "@heroicons/react/outline";

type LoaderData = {
  userId: number;
  userListItems: Awaited<ReturnType<typeof getUsers>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);

  if (user && user.name == null) {
    return redirect("/profile");
  }

  const userListItems = await getUsers();

  return json<LoaderData>({ userId: parseInt(params.userId), userListItems });
};

export default function UsersPage() {
  const data = useLoaderData<LoaderData>();
  const selectedUser = data.userListItems.find(
    (x: any) => x.id === data.userId
  );

  const [open, setOpen] = useState(false);

  const Users = () => {
    return data.userListItems.map((user) => (
      <li key={user.id}>
        <NavLink
          className={({ isActive }) =>
            `flex items-center border-b p-4 text-lg md:text-xl ${
              isActive ? "bg-white" : ""
            }`
          }
          to={`${user.id}`}
        >
          <Gravatar name={user.name} email={user.email} className="mr-4" />
          {user.name}
        </NavLink>
      </li>
    ));
  };

  return (
    <main className="flex h-full flex-col bg-white md:flex-row">
      <div className="w-full bg-gray-50 md:w-80 md:border-r">
        {/* <div className="flex items-center justify-between p-4 md:hidden">
          <div className="flex items-center">
            <Gravatar
              name={selectedUser.name}
              email={selectedUser.email}
              className="mr-4"
            />
            {selectedUser.name}
          </div>
        </div> */}
        <div className="flex justify-center py-2 md:hidden">
          <MenuIcon onClick={() => setOpen(!open)} className="h-6 w-6" />
        </div>
        {open && (
          <ol>
            <Users />
          </ol>
        )}
        <ol className="hidden md:block">
          <Users />
        </ol>
      </div>

      <div id="users_outlet" className="flex-1 p-6 md:overflow-auto">
        <Outlet />
      </div>
    </main>
  );
}
