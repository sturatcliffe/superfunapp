import { useEffect, useRef, useState } from "react";
import { Form, json, useActionData, useLoaderData, useTransition } from "remix";
import type {
  ActionFunction,
  LoaderFunction,
  ShouldReloadFunction,
} from "remix";
import Pusher from "pusher-js";
import { formatDistanceToNow } from "date-fns";

import { prisma } from "~/services/db.server";
import { requireUserId } from "~/services/session.server";
import { pusher } from "~/services/pusher.server";

import Input from "~/components/Input";
import Gravatar from "~/components/Gravatar";

type ActionData = {
  errors?: {
    text: string;
  };
};

export const unstable_shouldReload: ShouldReloadFunction = ({ prevUrl }) => {
  //don't reload the data after submitting a new message. Pusher will send the new message directly to the client
  return prevUrl.pathname !== "/chat";
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

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

  return json({ userId, messages });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const text = formData.get("text") as string | undefined;

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

  pusher.trigger("chat", "message", message);

  return json({});
};

export default function ChatPage() {
  const { userId, messages: initialMessages } = useLoaderData();
  const actionData = useActionData<ActionData>();

  const [messages, setMessages] = useState(initialMessages);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLUListElement>(null);
  const transition = useTransition();

  let isSubmitting = transition.submission;

  useEffect(() => {
    // @ts-ignore
    const pusher = new Pusher(window.ENV.PUSHER_APP_KEY, {
      cluster: "eu",
      forceTLS: true,
    });

    const channel = pusher.subscribe("chat");

    channel.bind("message", (data: any) => {
      setMessages((prev: any) => [...prev, data]);
    });
  }, []);

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
  }, [isSubmitting]);

  return (
    <>
      <ul
        ref={messagesRef}
        className="flex flex-grow flex-col items-start overflow-y-scroll p-4"
      >
        {messages.length === 0 && (
          <li className="rounded bg-teal-500 px-4 py-2 text-white">
            There are no messages here yet....be the first to send one using the
            form below!
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
        <Input
          ref={inputRef}
          type="text"
          name="text"
          placeholder="Hit enter to send..."
        />
      </Form>
    </>
  );
}