import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
} from "remix";
import { json, redirect } from "remix";
import { performMutation } from "remix-forms";

import { mutation, schema } from "~/domain/user/commands/sendPasswordResetCode";

import {
  forgotPassword,
  getSessionError,
  getUserId,
  jsonCommitSession,
} from "~/services/session.server";

import Form from "~/components/shared/Form";

type LoaderData = {
  error: Awaited<ReturnType<typeof getSessionError>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  const error = await getSessionError(request);
  return await jsonCommitSession<LoaderData>(request, { error });
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
  const { error } = useLoaderData<LoaderData>();
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form schema={schema} className="space-y-6">
          {({ Button, Error, Field }) => (
            <>
              {error && (
                <Error className="my-2 rounded border border-red-500 bg-red-200 px-4 py-2 text-left text-red-800">
                  {error}
                </Error>
              )}
              <Field name="email" label="E-mail address" />
              <Button className="w-full">Send me an OTP</Button>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
