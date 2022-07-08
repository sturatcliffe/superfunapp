import { forwardRef } from "react";

const Input = forwardRef(({ submitBtn, ...props }: any, ref: any) => (
  <div className="flex flex-1 rounded-md ring-2 ring-blue-500">
    <input
      ref={ref}
      className="w-full rounded-md px-3 text-lg leading-loose outline-none"
      {...props}
    />
    {submitBtn}
  </div>
));

Input.displayName = "Input";

export default Input;
