import classNames from "classnames";

export default function Label({
  children,
  className,
  ...props
}: JSX.IntrinsicElements["label"]) {
  return (
    <label
      className={classNames(
        "block text-sm font-medium",
        className,
        !className && "text-gray-700"
      )}
      {...props}
    >
      {children}
    </label>
  );
}
