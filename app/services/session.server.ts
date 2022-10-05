import { createCookieSessionStorage, redirect } from "remix";
import invariant from "tiny-invariant";

import type { User } from "~/domain/user.server";
import { getUserById } from "~/domain/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";
const RESET_PASSWORD_OTP_KEY = "resetPasswordOtp";
const RESET_PASSWORD_EMAIL_KEY = "resetPasswordEmail";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request: Request): Promise<number | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId ? parseInt(userId) : undefined;
}

export async function getUser(request: Request): Promise<null | User> {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<number> {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: number;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.unset(RESET_PASSWORD_EMAIL_KEY);
  session.unset(RESET_PASSWORD_OTP_KEY);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function forgotPassword(
  request: Request,
  email: string,
  otp: string
) {
  const session = await getSession(request);
  session.set(RESET_PASSWORD_EMAIL_KEY, email);
  session.set(RESET_PASSWORD_OTP_KEY, otp);
  return redirect("/reset-password", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 5,
      }),
    },
  });
}

export async function getResetPasswordEmail(request: Request) {
  const session = await getSession(request);
  return session.get(RESET_PASSWORD_EMAIL_KEY);
}

export async function validateOtp(
  request: Request,
  email: string,
  otp: string
) {
  const session = await getSession(request);

  if (
    !session.has(RESET_PASSWORD_EMAIL_KEY) ||
    !session.has(RESET_PASSWORD_OTP_KEY)
  ) {
    return false;
  }

  const sessionEmail = session.get(RESET_PASSWORD_EMAIL_KEY);
  const sessionOtp = session.get(RESET_PASSWORD_OTP_KEY);

  if (sessionEmail !== email || sessionOtp !== otp) {
    return false;
  }

  return true;
}

export async function resetPasswordFailure(request: Request) {
  const session = await getSession(request);
  session.unset(RESET_PASSWORD_EMAIL_KEY);
  session.unset(RESET_PASSWORD_OTP_KEY);
  session.flash("error", "This OTP has expired, please request a new one.");
  return redirect("/forgot-password", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: undefined,
      }),
    },
  });
}
