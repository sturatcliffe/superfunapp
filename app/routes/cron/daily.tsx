import { ActionFunction, json } from "remix";
import { daily } from "~/services/cron.server";

import { validateApiKey } from "~/utils";

export const action: ActionFunction = ({ request }) => {
  validateApiKey(request);

  daily();

  return json({}, { status: 200 });
};
