import * as Pusher from "pusher";

export const pusher = new Pusher.default({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: "eu",
  useTLS: true,
});
