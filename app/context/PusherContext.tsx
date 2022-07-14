import { createContext, FC, useContext } from "react";
import Pusher from "pusher-js";

const PusherContext = createContext<Pusher | undefined>(undefined);

interface Props {
  appKey: string | undefined;
}

export const PusherProvider: FC<Props> = ({ children, appKey }) => {
  let pusher: Pusher | undefined = undefined;

  if (appKey) {
    pusher = new Pusher(appKey, {
      cluster: "eu",
      forceTLS: true,
    });
  }

  return (
    <PusherContext.Provider value={pusher}>{children}</PusherContext.Provider>
  );
};

export const usePusher = () => useContext(PusherContext);
