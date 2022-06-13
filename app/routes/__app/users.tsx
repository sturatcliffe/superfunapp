import { json, useLoaderData, Outlet, NavLink, redirect } from "remix";
import type { LoaderFunction } from "remix";

import { requireUser } from "~/services/session.server";
import { getUsers } from "~/models/user.server";

import Gravatar from "~/components/Gravatar";

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
    <main className="flex flex-grow overflow-hidden bg-white">
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
                to={`${user.id}`}
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

      <div className="flex-1 overflow-y-scroll p-6">
        <Outlet />
      </div>
    </main>
  );
}
