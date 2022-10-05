import classNames from "classnames";

export default function Field({
  className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      className={classNames(className, !className && "flex flex-col space-y-1")}
      {...props}
    />
  );
}
