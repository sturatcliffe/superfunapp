import { LoaderFunction, redirect } from "remix";
import { getUserId } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);
  return redirect(userId ? "/users" : "/login");
};
