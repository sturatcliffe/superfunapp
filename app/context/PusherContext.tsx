import { createContext, FC, useContext, useEffect, useMemo } from "react";
import Pusher from "pusher-js";

const PusherContext = createContext<Pusher | undefined>(undefined);

interface Props {
  appKey: string | undefined;
}

export const PusherProvider: FC<Props> = ({ children, appKey }) => {
  let pusher: Pusher | undefined = undefined;

  if (appKey) {
    pusher = useMemo(() => {
      return new Pusher(appKey, {
        cluster: "eu",
        forceTLS: true,
      });
    }, []);
  }

  useEffect(() => () => pusher?.disconnect(), [pusher]);

  return (
    <PusherContext.Provider value={pusher}>{children}</PusherContext.Provider>
  );
};

export const usePusher = () => useContext(PusherContext);
