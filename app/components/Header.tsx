import { Fragment, useEffect, useState } from "react";
import { Link, Form, useLocation, useFetcher, useNavigate } from "remix";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon, TrashIcon } from "@heroicons/react/outline";
import { Notification } from "@prisma/client";

import { useMatchesData, useUser } from "~/utils";
import { usePusher } from "~/context/PusherContext";

import Gravatar from "./Gravatar";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Users", href: "/users" },
  { name: "Chat", href: "/chat" },
];

export default function Header() {
  const user = useUser();
  const rootData = useMatchesData("root");
  let location = useLocation();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const pusher = usePusher();

  const [notifications, setNotifications] = useState(
    rootData?.notifications as Notification[]
  );

  useEffect(() => {
    if (pusher) {
      const channel = pusher.subscribe("presence-chat");

      channel.bind("message", (data: any) => {
        if (window?.location.pathname !== "/chat" ?? false) {
          setNotifications((prev) => [
            ...prev.filter((x) => x.id !== -1),
            {
              id: -1,
              userId: user.id,
              message: "New chat message received",
              href: "/chat",
              read: false,
            },
          ]);
        }
      });

      return () => {
        pusher.unsubscribe("presence-chat");
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.pathname === "/chat" ?? false) {
      setNotifications((notifications) => [
        ...notifications.filter((x) => x.id !== -1),
      ]);
    }
  }, [location]);

  useEffect(() => {
    if (rootData) {
      setNotifications(rootData.notifications as Notification[]);
    }
  }, [rootData]);

  return (
    <Disclosure as="header" className="bg-slate-800">
      {({ open }) => (
        <>
          <div className="px-4">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/">
                    <img
                      className="w-36 md:w-48"
                      src="/logo.png"
                      alt="SuperFunApp"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          location.pathname === item.href
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                        aria-current={
                          location.pathname === item.href ? "page" : undefined
                        }
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Menu as="div" className="relative z-10">
                  <Menu.Button className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 flex h-1 w-1 md:h-2 md:w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-1 w-1 rounded-full bg-red-500 md:h-2 md:w-2"></span>
                      </span>
                    )}
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right rounded-md bg-white pt-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <>
                        {notifications.length > 0 ? (
                          <>
                            {notifications.map((notification, index) => {
                              const markAsRead = () => {
                                if (notification.id > 0) {
                                  const data = new FormData();
                                  data.set("id", notification.id.toString());
                                  data.set("_action", "single");

                                  fetcher.submit(data, {
                                    method: "post",
                                    action: "/notification",
                                  });
                                }
                              };

                              return (
                                <Menu.Item key={index}>
                                  {({ active }) => (
                                    <div
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "flex items-center justify-between px-4 py-2 text-sm text-gray-700"
                                      )}
                                    >
                                      <button
                                        className="text-left"
                                        onClick={() => {
                                          markAsRead();
                                          navigate(notification.href);
                                        }}
                                      >
                                        {notification.message}
                                      </button>
                                      <button onClick={() => markAsRead()}>
                                        <XIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </Menu.Item>
                              );
                            })}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={classNames(
                                    active
                                      ? "bg-red-100 text-red-500"
                                      : "bg-gray-100 text-gray-400",
                                    "flex w-full items-center justify-center rounded-b-md px-4 py-2 text-left text-xs"
                                  )}
                                  onClick={() => {
                                    const data = new FormData();
                                    data.set("_action", "all");

                                    fetcher.submit(data, {
                                      method: "post",
                                      action: "/notification",
                                    });
                                  }}
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Clear all
                                </button>
                              )}
                            </Menu.Item>
                          </>
                        ) : (
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                No new notifications
                              </div>
                            )}
                          </Menu.Item>
                        )}
                      </>
                    </Menu.Items>
                  </Transition>
                </Menu>

                {/* Profile dropdown */}
                <Menu as="div" className="relative z-10 ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none">
                      <span className="sr-only">Open user menu</span>
                      <Gravatar email={user.email} />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={`/users/${user.id}`}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Your list
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Form
                            action="/logout"
                            method="post"
                            className="w-full"
                          >
                            <button
                              type="submit"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block w-full px-4 py-2 text-left text-sm text-gray-700"
                              )}
                            >
                              Sign out
                            </button>
                          </Form>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={
                    location.pathname === item.href ? "page" : undefined
                  }
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
