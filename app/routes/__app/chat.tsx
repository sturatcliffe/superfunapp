import { useEffect, useRef, useState } from "react";
import { Form, json, useLoaderData } from "remix";
import type {
  ActionFunction,
  LoaderFunction,
  ShouldReloadFunction,
} from "remix";
import Pusher from "pusher-js";

import { prisma } from "~/services/db.server";
import { requireUserId } from "~/services/session.server";
import { pusher } from "~/services/pusher.server";

type ActionData = {
  errors: {
    text: string;
  };
};

export const unstable_shouldReload: ShouldReloadFunction = ({ prevUrl }) => {
  //don't reload the data after submitting a new message. Pusher will send the new message directly to the client
  return prevUrl.pathname !== "/chat";
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const messages = await prisma.message.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true } },
    },
  });

  return json({ key: process.env.PUSHER_APP_KEY, messages });
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
      user: { select: { id: true, name: true } },
    },
  });

  pusher.trigger("chat", "message", message);

  return null;
};

export default function ChatPage() {
  const { key, messages: initialMessages } = useLoaderData();
  const [messages, setMessages] = useState(initialMessages);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const pusher = new Pusher(key, {
      cluster: "eu",
      forceTLS: true,
    });

    const channel = pusher.subscribe("chat");

    channel.bind("message", (data: any) => {
      setMessages([...messages, data]);
    });
  }, []);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <h1>Chat</h1>
      <pre>{JSON.stringify({ messages }, null, 3)}</pre>
      <Form method="post" ref={formRef}>
        <input type="text" name="text" placeholder="Message..." />
        <button type="submit">Send</button>
      </Form>
    </>
  );
}
