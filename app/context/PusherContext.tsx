import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Pusher, { PresenceChannel } from "pusher-js";

const PusherContext = createContext<{
  pusher: Pusher | undefined;
  channel: PresenceChannel | undefined;
  members: number[];
}>({ pusher: undefined, channel: undefined, members: [] });

interface Props {
  appKey: string | undefined;
}

export const PusherProvider: FC<Props> = ({ children, appKey }) => {
  const [members, setMembers] = useState<number[]>([]);

  const pusher = useMemo(() => {
    if (typeof window !== "undefined" && appKey) {
      return new Pusher(appKey, {
        cluster: "eu",
        forceTLS: true,
      });
    }
    return undefined;
  }, [appKey]);

  const channelRef = useRef<PresenceChannel | undefined>();

  const checkOnlineMembers = () => {
    setMembers([]);
    channelRef.current?.members.each((member: any) => {
      const { id } = member;
      setMembers((prev) => [...prev, parseInt(id)]);
    });
  };

  useEffect(() => {
    pusher?.signin();

    channelRef.current = pusher?.subscribe("presence-chat") as PresenceChannel;

    channelRef.current?.bind("pusher:subscription_succeeded", () => {
      checkOnlineMembers();
    });

    channelRef.current?.bind("pusher:member_added", () => {
      setTimeout(checkOnlineMembers, 3000);
    });

    channelRef.current?.bind("pusher:member_removed", () => {
      setTimeout(checkOnlineMembers, 3000);
    });

    return () => {
      pusher?.disconnect();
    };
  }, [pusher]);

  return (
    <PusherContext.Provider
      value={{ pusher, channel: channelRef.current, members }}
    >
      {children}
    </PusherContext.Provider>
  );
};

export const usePusher = () => useContext(PusherContext);
