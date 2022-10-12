import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import { json, redirect } from "remix";
import { performMutation } from "remix-forms";

import { mutation, schema } from "~/domain/user/commands/sendPasswordResetCode";

import { forgotPassword, getUserId } from "~/services/session.server";

import Form from "~/components/shared/Form";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const result = await performMutation({ request, schema, mutation });

  if (!result.success) return json(result, 400);

  const { email, otp } = result.data!;

  if (!email || !otp) return redirect("/reset-password");

  return forgotPassword(request, email, otp);
};

export const meta: MetaFunction = () => {
  return {
    title: "Forgotten Password",
  };
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form schema={schema} className="space-y-6">
          {({ Button, Errors, Field }) => (
            <>
              <Errors className="my-2 rounded border border-red-500 bg-red-300 px-4 py-2 text-center text-red-800" />
              <Field name="email" label="E-mail address" />
              <Button className="w-full">Send me an OTP</Button>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
