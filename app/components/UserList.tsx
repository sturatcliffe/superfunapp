import { NavLink } from "remix";

import { usePusher } from "~/context/PusherContext";

import { getUsers } from "~/models/user.server";

import Gravatar from "./Gravatar";

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

  const RenderUser = ({
    user,
    isOnline,
    isActive = false,
  }: {
    user: any;
    isOnline: boolean;
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
                    isActive={isActive}
                  />
                )}
              </NavLink>
            ) : (
              <RenderUser user={user} isOnline={isOnline} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
