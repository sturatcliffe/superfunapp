import { useEffect, useRef } from "react";
import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import { Form, json, useActionData, useLoaderData, redirect } from "remix";
import { getUserByEmail } from "~/models/user.server";
import { sendMail } from "~/services/email.server";

import {
  forgotPassword,
  getSession,
  getUserId,
  sessionStorage,
} from "~/services/session.server";
import { validateEmail } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const session = await getSession(request);
  const error = session.get("error");

  return json<LoaderData>(
    {
      error,
    },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    }
  );
};

interface LoaderData {
  error?: string;
}

interface ActionData {
  errors?: {
    email?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return redirect("/reset-password");
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  const body = `
    <p>Hi${user.name ? ` ${user.name}` : ""},</p>
    <p>Your OTP for resetting your password is: <b>${otp}</b>. This OTP will expire in 5 minutes.</p>
    <p>If you didn't request this password reset OTP, well, we don't really care!</p>
    <p>Toodles!</p>
  `;

  await sendMail(
    user.name ?? user.email,
    user.email,
    "SuperFunApp: Reset your password",
    body
  );

  return forgotPassword(request, email, otp.toString());
};

export const meta: MetaFunction = () => {
  return {
    title: "Forgotten Password",
  };
};

const ForgotPasswordPage = () => {
  const { error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        {error && (
          <div className="my-2 rounded border border-red-500 bg-red-300 px-4 py-2 text-center text-red-800">
            {error}
          </div>
        )}
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Send me an OTP
          </button>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
