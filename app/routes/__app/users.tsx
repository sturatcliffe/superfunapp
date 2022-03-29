import { json, useLoaderData, Outlet, NavLink } from "remix";
import type { LoaderFunction } from "remix";

import { requireUserId } from "~/session.server";
import { getUsers } from "~/models/user.server";

type LoaderData = {
  userListItems: Awaited<ReturnType<typeof getUsers>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const userListItems = await getUsers();
  return json<LoaderData>({ userListItems });
};

export default function UsersPage() {
  const data = useLoaderData() as LoaderData;
  return (
    <div className="flex h-full min-h-screen flex-col">
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <ol>
            {data.userListItems.map((user) => (
              <li key={user.id}>
                <NavLink
                  className={({ isActive }) =>
                    `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                  }
                  to={user.id}
                >
                  📝 {user.email}
                </NavLink>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
