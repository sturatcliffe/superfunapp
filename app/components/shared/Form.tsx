import { Form as RemixForm, FormProps } from "remix-forms";
import { SomeZodObject } from "zod";
import classNames from "classnames";

import Button from "./Button";
import Checkbox from "./Checkbox";
import CheckboxWrapper from "./CheckboxWrapper";
import Error from "./Error";
import Field from "./Field";
import Input from "./Input";
import Label from "./Label";

export default function Form<Schema extends SomeZodObject>({
  className,
  ...props
}: FormProps<Schema>) {
  return (
    <RemixForm<Schema>
      {...props}
      className={classNames(className, !className && "flex flex-col space-y-6")}
      buttonComponent={Button}
      checkboxComponent={Checkbox}
      checkboxWrapperComponent={CheckboxWrapper}
      errorComponent={Error}
      fieldComponent={Field}
      inputComponent={Input}
      labelComponent={Label}
    />
  );
}
