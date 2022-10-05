import { useState } from "react";
import { json, useLoaderData, Outlet, redirect } from "remix";
import type { LoaderFunction } from "remix";
import { MenuIcon } from "@heroicons/react/outline";

import { requireUser } from "~/services/session.server";
import { getUsers } from "~/domain/user.server";

import UserList from "~/components/UserList";

type LoaderData = {
  user: Awaited<ReturnType<typeof requireUser>>;
  userListItems: Awaited<ReturnType<typeof getUsers>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  if (user && user.name == null) {
    return redirect("/profile");
  }

  const userListItems = await getUsers();

  return json<LoaderData>({
    user,
    userListItems,
  });
};

export default function UsersPage() {
  const { user, userListItems } = useLoaderData<LoaderData>();

  const [open, setOpen] = useState(false);

  return (
    <main className="flex h-full flex-col bg-white md:flex-row">
      <div className="w-full bg-gray-50 md:w-80 md:border-r">
        <div className="flex justify-center py-2 md:hidden">
          <MenuIcon onClick={() => setOpen(!open)} className="h-6 w-6" />
        </div>
        <div className={open ? "block" : "hidden md:block"}>
          <UserList
            userId={user.id}
            users={userListItems}
            renderAsLinks={true}
          />
        </div>
      </div>
      <Outlet />
    </main>
  );
}
