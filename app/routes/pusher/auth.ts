import { ActionFunction } from "remix";

import { requireUser } from "~/services/session.server";
import { pusher } from "~/services/pusher.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const form = await request.formData();

  const socketId = form.get("socket_id") as string | undefined;
  const channel = form.get("channel_name") as string | undefined;

  if (!socketId || !channel)
    throw new Error("Missing socket ID and/or channel in request body.");

  const authResponse = pusher.authorizeChannel(socketId, channel, {
    user_id: user.id.toString(),
    user_info: {
      name: user.name,
    },
  });

  return authResponse;
};
