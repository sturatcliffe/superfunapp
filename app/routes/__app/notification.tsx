import { ActionFunction, json } from "remix";
import { InferType, number, object } from "yup";
import { validateFormData } from "~/utils";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "~/models/notification.server";
import { requireUserId } from "~/services/session.server";

const schema = object({
  id: number().required().positive(),
});

type NotificationRequest = InferType<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  const currentUserId = await requireUserId(request);
  const form = await request.formData();
  const action = form.get("_action");

  switch (action) {
    case "single":
      return handleSingle(currentUserId, form);
    case "all":
      return handleAll(currentUserId);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
};

const handleSingle = async (currentUserId: number, form: FormData) => {
  const { data, errors } = await validateFormData<NotificationRequest>(
    form,
    schema
  );

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  const { id } = data;

  await markNotificationRead(currentUserId, id);

  return json({});
};

const handleAll = async (currentUserId: number) => {
  await markAllNotificationsRead(currentUserId);
  return json({});
};
