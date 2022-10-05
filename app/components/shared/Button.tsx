import classNames from "classnames";

export default function Button({
  className,
  variant = "primary",
  ...props
}: { variant?: "primary" | "secondary" } & JSX.IntrinsicElements["button"]) {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center self-end rounded-md border py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        className,
        variant === "primary"
          ? "border-transparent bg-indigo-600 text-white hover:bg-indigo-700"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      )}
      {...props}
    />
  );
}
