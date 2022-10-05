import { ActionFunction, redirect } from "remix";
import { setItemScore } from "~/domain/item.server";
import { requireUserId } from "~/services/session.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const form = await request.formData();

  for (const item of form.entries()) {
    await setItemScore({
      userId,
      itemId: parseInt(item[0] as string),
      score: parseInt(item[1] as string),
    });
  }

  return redirect("/");
};
