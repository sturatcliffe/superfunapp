import { json, useLoaderData, Outlet, NavLink, redirect } from "remix";
import type { LoaderFunction } from "remix";

import { requireUser } from "~/services/session.server";
import { getUsers } from "~/models/user.server";
import { Md5 } from "md5-typescript";

type LoaderData = {
  userListItems: Awaited<ReturnType<typeof getUsers>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  if (user && user.name == null) {
    return redirect("/profile");
  }

  const userListItems = await getUsers();

  return json<LoaderData>({ userListItems });
};

export default function UsersPage() {
  const data = useLoaderData<LoaderData>();
  return (
    <main className="flex flex-grow bg-white">
      <div className="w-80 border-r bg-gray-50">
        <ol>
          {data.userListItems.map((user) => (
            <li key={user.id}>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center border-b p-4 text-xl ${
                    isActive ? "bg-white" : ""
                  }`
                }
                to={user.id}
              >
                <img
                  className="mr-4 rounded-full"
                  src={`https://www.gravatar.com/avatar/${Md5.init(
                    user.email
                  )}?s=30&d=retro`}
                  alt={user.name}
                />
                {user.name}
              </NavLink>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </main>
  );
}
