import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import { json, useLoaderData, redirect } from "remix";
import { performMutation } from "remix-forms";

import { mutation, schema } from "~/domain/user/commands/resetPassword";

import Form from "~/components/shared/Form";

import {
  createUserSession,
  getEmailAndOtp,
  getResetPasswordEmail,
  getUserId,
  resetPasswordFailure,
} from "~/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  return json<LoaderData>({
    email: await getResetPasswordEmail(request),
  });
};

interface LoaderData {
  email: Awaited<ReturnType<typeof getResetPasswordEmail>>;
}

export const action: ActionFunction = async ({ request }) => {
  const { email: sessionEmail, otp: sessionOtp } = await getEmailAndOtp(
    request
  );

  console.log({ sessionEmail, sessionOtp });

  const result = await performMutation({
    request,
    schema,
    mutation,
    environment: { sessionEmail, sessionOtp },
  });

  console.log(result);

  if (!result.success) return resetPasswordFailure(request);

  const { userId } = result.data;

  return createUserSession({
    request,
    userId,
    remember: false,
    redirectTo: `/users/${userId}`,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Reset Password",
  };
};

const ResetPasswordPage = () => {
  const { email } = useLoaderData<LoaderData>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form
          schema={schema}
          hiddenFields={["email"]}
          values={{ email }}
          className="space-y-6"
        >
          {({ Button, Field }) => (
            <>
              <Field name="email" />
              <Field name="otp" label="Code" />
              <Field name="password" type="password" />
              <Field name="confirmPassword" type="password" />
              <Button className="w-full">Reset my password</Button>
            </>
          )}
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
