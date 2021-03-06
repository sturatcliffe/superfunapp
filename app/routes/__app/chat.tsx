import { useEffect, useRef, useState } from "react";
import { Form, json, useActionData, useLoaderData, useTransition } from "remix";
import type { ActionFunction, LoaderFunction } from "remix";
import { formatDistanceToNow } from "date-fns";

import { usePusher } from "~/context/PusherContext";

import { prisma } from "~/services/db.server";
import { requireUserId } from "~/services/session.server";
import { pusher } from "~/services/pusher.server";

import Input from "~/components/Input";
import Gravatar from "~/components/Gravatar";
import { createNotification } from "~/models/notification.server";

type ActionData = {
  errors?: {
    text: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const messages = await prisma.message.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastReadMessages: new Date(),
    },
  });

  return json({ userId, users, messages });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const text = formData.get("text") as string | undefined;
  const socketId = formData.get("socketId") as string | undefined;

  if (!text) {
    return json<ActionData>(
      { errors: { text: "You must enter a message" } },
      { status: 400 }
    );
  }

  const { id } = await prisma.message.create({
    data: {
      text,
      userId,
    },
  });

  const message = await prisma.message.findUnique({
    where: { id },
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: userId,
      },
    },
    select: {
      id: true,
    },
  });

  for (const user of users) {
    const { id } = user;
    await createNotification(
      id,
      `${message?.user.name}: ${
        message && message.text.length > 15
          ? `${message?.text.substring(0, 15)}...`
          : message?.text
      }`,
      "/chat"
    );
  }

  pusher.trigger("presence-chat", "message", message, {
    socket_id: socketId,
  });

  return json({});
};

export default function ChatPage() {
  const { userId, users, messages: initialMessages } = useLoaderData();
  const actionData = useActionData<ActionData>();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLUListElement>(null);

  const [messages, setMessages] = useState(initialMessages);
  const [members, setMembers] = useState<number[]>([]);
  const [socketId, setSocketId] = useState<string | undefined>();

  const transition = useTransition();
  const { pusher, channel } = usePusher();

  let isSubmitting = transition.submission;

  useEffect(() => {
    if (pusher) {
      pusher.connection.bind("connected", () => {
        setSocketId(pusher.connection.socket_id);
      });
    }

    if (channel) {
      channel.members.each((member: any) => {
        const { id } = member;
        setMembers((prev) => [id, ...prev]);
      });

      channel.bind("message", (data: any) => {
        setMessages((prev: any) => [...prev, data]);
      });

      channel.bind("pusher:member_added", (data: any) => {
        const { id } = data;
        setMembers((prev) => [id, ...prev]);
      });

      channel.bind("pusher:member_removed", (data: any) => {
        const { id } = data;
        setMembers((prev) => [...prev.filter((x) => x !== id)]);
      });
    }

    return () => {
      pusher?.connection.unbind("connected");
      channel?.unbind("message");
      channel?.unbind("pusher:member_added");
      channel?.unbind("pusher:member_removed");
    };
  }, [pusher, channel]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isSubmitting && !actionData?.errors) {
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }
  }, [isSubmitting, actionData?.errors]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  return (
    <main className="flex h-full flex-col bg-white md:flex-row">
      <div className="w-full bg-gray-50 md:w-80 md:border-r">
        <ol>
          {users.map((user: any) => {
            const isOnline =
              userId === user.id ||
              members.some((x) => x === user.id.toString());

            return (
              <li
                key={user.id}
                className={`flex items-center border-b p-4 text-lg md:text-xl ${
                  isOnline ? "" : "opacity-50"
                }`}
              >
                <Gravatar
                  name={user.name}
                  email={user.email}
                  className="mr-4"
                />
                <div className="flex items-center">
                  <div className="text-md">{user.name}</div>
                  <div
                    className={`ml-2 h-2 w-2 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-gray-300"
                    } `}
                  ></div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex h-full w-full flex-col">
        <ul
          ref={messagesRef}
          className="flex flex-1 flex-col items-start overflow-auto p-4"
        >
          {messages.length === 0 && (
            <li className="w-full rounded bg-teal-500 px-4 py-2 text-white">
              There are no messages here yet....be the first to send one using
              the form below!
            </li>
          )}
          {messages.map((message: any) => (
            <li
              key={message.id}
              className={`mb-4 flex items-center last:mb-0 ${
                message.user.id === userId
                  ? "flex-row-reverse self-end"
                  : "flex-row"
              }`}
            >
              <Gravatar
                size={50}
                name={message.user.name}
                email={message.user.email}
              />
              <div
                className={`rounded px-4 py-2 text-xs font-bold text-white ${
                  message.user.id === userId
                    ? "mr-4 ml-16 bg-gray-500"
                    : "ml-4 mr-16 bg-teal-500"
                }`}
              >
                <div className="flex justify-between">
                  <span className="mr-8">
                    {message.user.id === userId ? "You" : message.user.name}
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(message.createdAt))} ago
                  </span>
                </div>
                <p className="mt-2">{message.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <Form method="post" className="p-4">
          <input type="hidden" name="socketId" defaultValue={socketId} />
          <Input
            ref={inputRef}
            type="text"
            name="text"
            placeholder="Hit enter to send..."
          />
        </Form>
      </div>
    </main>
  );
}
