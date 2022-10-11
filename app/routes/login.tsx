import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import { json, Link, redirect, useSearchParams } from "remix";
import { performMutation } from "remix-forms";

import { mutation, schema } from "~/domain/user/commands/verifyLogin";

import { createUserSession, getUserId } from "~/services/session.server";

import CheckboxWrapper from "~/components/shared/CheckboxWrapper";
import Form from "~/components/shared/Form";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const result = await performMutation({
    request,
    schema,
    mutation,
  });

  if (!result.success) return json(result, 400);

  const { id: userId, remember, redirectTo } = result.data;

  return createUserSession({
    request,
    userId,
    remember,
    redirectTo:
      typeof redirectTo === "string" ? redirectTo : `/users/${userId}`,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || undefined;

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form
          className="space-y-6"
          schema={schema}
          hiddenFields={["redirectTo"]}
          values={{ redirectTo }}
        >
          {({ Button, Errors, Field }) => (
            <>
              <Errors className="rounded border border-red-500 bg-red-200 px-4 py-2" />
              <Field name="redirectTo" />
              <Field name="email" label="Email address" />
              <Field name="password" type="password" />
              <Link
                className="pt-1 text-sm text-blue-500 underline"
                to="/forgot-password"
              >
                Forgotten your password?
              </Link>
              <Button className="w-full rounded">Log in</Button>
              <div className="flex items-center justify-between">
                <Field name="remember">
                  {({ Label, SmartInput }) => (
                    <CheckboxWrapper>
                      <SmartInput />
                      <Label className="font-normal text-gray-900">
                        Remember me
                      </Label>
                    </CheckboxWrapper>
                  )}
                </Field>
                <div className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link
                    className="text-blue-500 underline"
                    to={{
                      pathname: "/join",
                      search: searchParams.toString(),
                    }}
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
