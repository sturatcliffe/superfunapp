import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  useFetcher,
} from "remix";
import { Link, redirect, useSearchParams, json } from "remix";
import { performMutation } from "remix-forms";

import {
  mutation,
  schema,
  validateUniqueEmail,
} from "~/domain/user/commands/register";

import { getUserId, createUserSession } from "~/services/session.server";

import Form from "~/components/shared/Form";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (email && !(await validateUniqueEmail(email))) {
    return json({ invalidEmail: true });
  }

  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const result = await performMutation({
    request,
    schema,
    mutation,
  });

  if (!result.success) return json(result, 400);

  const { id, redirectTo } = result.data;

  return createUserSession({
    request,
    userId: id,
    remember: false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : `/users/${id}`,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;

  const fetcher = useFetcher();
  const invalidEmail = fetcher.data?.invalidEmail;

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form
          schema={schema}
          labels={{ email: "E-mail address" }}
          hiddenFields={["redirectTo"]}
          values={{ redirectTo }}
          className="space-y-6"
        >
          {({ Button, clearErrors, Field }) => (
            <>
              <Field name="redirectTo" />
              <Field name="name" />
              <Field name="email" type="email">
                {({ Error, Errors, Label, Input }) => (
                  <>
                    <Label />
                    <Input
                      onChange={(e) => {
                        clearErrors("email");
                        fetcher.load(`/join?email=${e.target.value}`);
                      }}
                    />
                    <Errors />
                    {invalidEmail && (
                      <Error>This e-mail address is already in use.</Error>
                    )}
                  </>
                )}
              </Field>
              <Field name="password" type="password" />
              <Field name="confirmPassword" type="password" />
              <Button className="w-full">Create Account</Button>
              <div className="flex items-center justify-center">
                <div className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    className="text-blue-500 underline"
                    to={{
                      pathname: "/login",
                      search: searchParams.toString(),
                    }}
                  >
                    Log in
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
