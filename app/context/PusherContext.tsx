import { createContext, FC, useContext, useEffect, useMemo } from "react";
import Pusher, { PresenceChannel } from "pusher-js";

const PusherContext = createContext<{
  pusher: Pusher | undefined;
  channel: PresenceChannel | undefined;
}>({ pusher: undefined, channel: undefined });

interface Props {
  appKey: string | undefined;
}

export const PusherProvider: FC<Props> = ({ children, appKey }) => {
  const pusher = useMemo(() => {
    if (typeof window !== "undefined" && appKey) {
      return new Pusher(appKey, {
        cluster: "eu",
        forceTLS: true,
      });
    }
    return undefined;
  }, [appKey]);

  pusher?.signin();

  const channel = pusher?.subscribe("presence-chat") as PresenceChannel;

  useEffect(
    () => () => {
      pusher?.unsubscribe("presence-chat");
      pusher?.disconnect();
    },
    [pusher]
  );

  return (
    <PusherContext.Provider value={{ pusher, channel }}>
      {children}
    </PusherContext.Provider>
  );
};

export const usePusher = () => useContext(PusherContext);
