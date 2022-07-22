import { ActionFunction } from "remix";

import { requireUser } from "~/services/session.server";
import { pusher } from "~/services/pusher.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const form = await request.formData();

  const socketId = form.get("socket_id") as string | undefined;

  if (!socketId) throw new Error("Missing socket ID in request body.");

  const authResponse = pusher.authenticateUser(socketId, {
    id: user.id.toString(),
  });

  return authResponse;
};
