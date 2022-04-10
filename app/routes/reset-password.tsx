import { useEffect, useRef } from "react";
import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import { Form, json, useActionData, useLoaderData, redirect } from "remix";
import { getUserByEmail, updatePassword } from "~/models/user.server";

import {
  createUserSession,
  getResetPasswordEmail,
  getUserId,
  resetPasswordFailure,
  validateOtp,
} from "~/services/session.server";
import { validateEmail, validatePassword } from "~/utils";

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

interface ActionData {
  errors?: {
    email?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const otp = formData.get("otp");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof otp !== "string") {
    return json<ActionData>(
      { errors: { otp: "OTP is required" } },
      { status: 400 }
    );
  }

  if (!validatePassword(password)) {
    return json<ActionData>(
      { errors: { password: "Password must be 8 characters or more." } },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return json<ActionData>(
      { errors: { confirmPassword: "Both passwords must match." } },
      { status: 400 }
    );
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return await resetPasswordFailure(request);
  }

  if (!(await validateOtp(request, email, otp))) {
    return await resetPasswordFailure(request);
  }

  await updatePassword(user.id, password);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: "/users",
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Reset Password",
  };
};

const ResetPasswordPage = () => {
  const { email } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.otp) {
      otpRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.confirmPassword) {
      confirmPasswordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
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
                disabled={true}
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                value={email}
                className="w-full cursor-not-allowed rounded border border-gray-500 px-2 py-1 text-lg opacity-60"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700"
            >
              OTP
            </label>
            <div className="mt-1">
              <input
                ref={otpRef}
                id="otp"
                required
                autoFocus={true}
                name="otp"
                type="text"
                autoComplete="otp"
                aria-invalid={actionData?.errors?.otp ? true : undefined}
                aria-describedby="otp-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.otp && (
                <div className="pt-1 text-red-700" id="otp-error">
                  {actionData.errors.otp}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New password
            </label>
            <div className="mt-1">
              <input
                ref={passwordRef}
                id="password"
                required
                autoFocus={true}
                name="password"
                type="password"
                autoComplete="password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <div className="mt-1">
              <input
                ref={confirmPasswordRef}
                id="confirm-password"
                required
                autoFocus={true}
                name="confirmPassword"
                type="password"
                autoComplete="confirmPassword"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="confirm-password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.confirmPassword && (
                <div className="pt-1 text-red-700" id="confirm-password-error">
                  {actionData.errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Reset my password
          </button>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
