import { forwardRef } from "react";
import classNames from "classnames";

const Input = forwardRef<HTMLInputElement, JSX.IntrinsicElements["input"]>(
  ({ type = "text", className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={classNames(
          "block w-full rounded-md shadow-sm sm:text-sm",
          className,
          className
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
