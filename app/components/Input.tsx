import { forwardRef } from "react";

const Input = forwardRef((props: any, ref: any) => (
  <input
    ref={ref}
    className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
    {...props}
  />
));

export default Input;
