import { HTMLAttributes } from "react";
import { Md5 } from "md5-typescript";

interface Props {
  size?: number;
  name?: string | null;
  email: string;
}

const Gravatar = ({
  size = 30,
  name,
  email,
  className,
}: Props & HTMLAttributes<HTMLImageElement>) => {
  return (
    <img
      className={`rounded-full ${className}`}
      src={`https://www.gravatar.com/avatar/${Md5.init(
        email
      )}?s=${size}&d=retro`}
      alt={name ?? email}
    />
  );
};

export default Gravatar;
