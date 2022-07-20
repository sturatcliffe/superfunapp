import { json, LoaderFunction, Outlet, useLoaderData } from "remix";

import Header from "~/components/Header";

import { PusherProvider } from "~/context/PusherContext";

type LoaderData = {
  PUSHER_APP_KEY: string | undefined;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY,
  });
};

export default function AppLayout() {
  const { PUSHER_APP_KEY } = useLoaderData<LoaderData>();
  return (
    <PusherProvider appKey={PUSHER_APP_KEY}>
      <Header />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </PusherProvider>
  );
}
