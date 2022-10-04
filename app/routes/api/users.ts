import { ActionFunction, json, LoaderFunction } from "remix";

import { getUsersWhoHaventWatched } from "~/models/user.server";
import { getMostRecentItemByTT, upsertItem } from "~/models/item.server";
import { requireUserId } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const tt = url.searchParams.get("unwatched");

  if (!tt) throw new Error("Must provide unwatched tt param");

  return json(await getUsersWhoHaventWatched(tt));
};

export const action: ActionFunction = async ({ request }) => {
  const currentUserId = await requireUserId(request);
  const formData = await request.formData();
  const ttFormValue = formData.get("tt");
  const users = formData.getAll("users");

  if (!ttFormValue) throw new Error("Must provide tt of item to add");

  const existingItem = await getMostRecentItemByTT(ttFormValue.toString());

  if (!existingItem)
    throw new Error(`Cannot find item with tt: ${ttFormValue}`);

  const { tt, title, description, image, url } = existingItem;

  for (const user of users) {
    await upsertItem({
      tt,
      title,
      description,
      image,
      url,
      userId: parseInt(user.toString()),
      createdById: currentUserId,
    });
  }

  return json({});
};
