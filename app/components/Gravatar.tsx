import { HTMLAttributes } from "react";
import { Md5 } from "md5-typescript";

interface Props {
  size?: number;
  name?: string | null;
  email: string;
}

export const buildUrl = ({ email, size }: { email: string; size: number }) => {
  return `https://www.gravatar.com/avatar/${Md5.init(email)}?s=${size}&d=retro`;
};

const Gravatar = ({
  size = 30,
  name,
  email,
  className,
}: Props & HTMLAttributes<HTMLImageElement>) => {
  return (
    <img
      className={`rounded-full ${className}`}
      src={buildUrl({ email, size })}
      alt={name ?? email}
    />
  );
};

export default Gravatar;
