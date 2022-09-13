import { NavLink, redirect } from "remix";

import { usePusher } from "~/context/PusherContext";

import { getUsers } from "~/models/user.server";

import Gravatar from "./Gravatar";

const RenderUser = ({
  user,
  isOnline,
  renderAsLinks,
  isActive = false,
}: {
  user: any;
  isOnline: boolean;
  renderAsLinks: boolean;
  isActive?: boolean;
}) => (
  <div
    className={`flex items-center border-b p-4 text-lg md:text-xl ${
      isOnline || renderAsLinks ? "" : "opacity-50"
    } ${isActive ? "bg-white" : ""}`}
  >
    <Gravatar name={user.name} email={user.email} className="mr-4" />
    <div className="flex items-center">
      <div className="text-md">{user.name}</div>
      <div
        className={`ml-2 h-2 w-2 rounded-full ${
          isOnline ? "bg-green-500" : "bg-gray-300"
        } `}
      ></div>
    </div>
  </div>
);

export default function UserList({
  userId,
  users,
  renderAsLinks = false,
}: {
  userId: number;
  users: Awaited<ReturnType<typeof getUsers>>;
  renderAsLinks?: boolean;
}) {
  const { members } = usePusher();

  return (
    <ol>
      {users.map((user) => {
        const isOnline =
          userId === user.id || members.some((x) => x === user.id);

        return (
          <li key={user.id}>
            {renderAsLinks ? (
              <NavLink to={`${user.id}`}>
                {({ isActive }) => (
                  <RenderUser
                    user={user}
                    isOnline={isOnline}
                    renderAsLinks={renderAsLinks}
                    isActive={isActive}
                  />
                )}
              </NavLink>
            ) : (
              <RenderUser
                user={user}
                isOnline={isOnline}
                renderAsLinks={renderAsLinks}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
