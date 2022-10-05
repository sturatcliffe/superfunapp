import { forwardRef } from "react";
import classNames from "classnames";

const Checkbox = forwardRef<HTMLInputElement, JSX.IntrinsicElements["input"]>(
  ({ type = "checkbox", className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={classNames(
          "h-4 w-4 rounded",
          className,
          !className && "border-gray-300 text-indigo-600 focus:ring-indigo-500"
        )}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
