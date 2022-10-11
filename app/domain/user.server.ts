import {
  NotificationEvent,
  NotificationMethod,
  Password,
  User,
} from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/services/db.server";

export type { User } from "@prisma/client";

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUsersWhoHaventWatched(tt: string) {
  return prisma.user.findMany({
    where: {
      items: {
        none: {
          tt,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function updateProfile(
  id: User["id"],
  name: User["name"],
  email: User["email"],
  phone: User["phone"],
  watchlistEmail: boolean,
  chatEmail: boolean,
  usersEmail: boolean,
  watchlistSms: boolean,
  chatSms: boolean,
  usersSms: boolean,
  watchlistPush: boolean,
  chatPush: boolean,
  usersPush: boolean
) {
  return prisma.user.update({
    where: {
      id: id,
    },
    data: {
      name,
      email,
      phone,
      preferences: {
        upsert: [
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Watchlist"],
                method: NotificationMethod["Email"],
              },
            },
            create: {
              event: NotificationEvent["Watchlist"],
              method: NotificationMethod["Email"],
              enabled: watchlistEmail,
            },
            update: {
              event: NotificationEvent["Watchlist"],
              method: NotificationMethod["Email"],
              enabled: watchlistEmail,
            },
          },
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Chat"],
                method: NotificationMethod["Email"],
              },
            },
            create: {
              event: NotificationEvent["Chat"],
              method: NotificationMethod["Email"],
              enabled: chatEmail,
            },
            update: {
              event: NotificationEvent["Chat"],
              method: NotificationMethod["Email"],
              enabled: chatEmail,
            },
          },
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Users"],
                method: NotificationMethod["Email"],
              },
            },
            create: {
              event: NotificationEvent["Users"],
              method: NotificationMethod["Email"],
              enabled: usersEmail,
            },
            update: {
              event: NotificationEvent["Users"],
              method: NotificationMethod["Email"],
              enabled: usersEmail,
            },
          },
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Watchlist"],
                method: NotificationMethod["SMS"],
              },
            },
            create: {
              event: NotificationEvent["Watchlist"],
              method: NotificationMethod["SMS"],
              enabled: watchlistSms,
            },
            update: {
              event: NotificationEvent["Watchlist"],
              method: NotificationMethod["SMS"],
              enabled: watchlistSms,
            },
          },
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Chat"],
                method: NotificationMethod["SMS"],
              },
            },
            create: {
              event: NotificationEvent["Chat"],
              method: NotificationMethod["SMS"],
              enabled: chatSms,
            },
            update: {
              event: NotificationEvent["Chat"],
              method: NotificationMethod["SMS"],
              enabled: chatSms,
            },
          },
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Users"],
                method: NotificationMethod["SMS"],
              },
            },
            create: {
              event: NotificationEvent["Users"],
              method: NotificationMethod["SMS"],
              enabled: usersSms,
            },
            update: {
              event: NotificationEvent["Users"],
              method: NotificationMethod["SMS"],
              enabled: usersSms,
            },
          },
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Watchlist"],
                method: NotificationMethod["Push"],
              },
            },
            create: {
              event: NotificationEvent["Watchlist"],
              method: NotificationMethod["Push"],
              enabled: watchlistPush,
            },
            update: {
              event: NotificationEvent["Watchlist"],
              method: NotificationMethod["Push"],
              enabled: watchlistPush,
            },
          },
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Chat"],
                method: NotificationMethod["Push"],
              },
            },
            create: {
              event: NotificationEvent["Chat"],
              method: NotificationMethod["Push"],
              enabled: chatPush,
            },
            update: {
              event: NotificationEvent["Chat"],
              method: NotificationMethod["Push"],
              enabled: chatPush,
            },
          },
          {
            where: {
              userId_method_event: {
                userId: id,
                event: NotificationEvent["Users"],
                method: NotificationMethod["Push"],
              },
            },
            create: {
              event: NotificationEvent["Users"],
              method: NotificationMethod["Push"],
              enabled: usersPush,
            },
            update: {
              event: NotificationEvent["Users"],
              method: NotificationMethod["Push"],
              enabled: usersPush,
            },
          },
        ],
      },
    },
  });
}

export async function updatePassword(id: User["id"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.password.update({
    where: {
      userId: id,
    },
    data: {
      hash: hashedPassword,
    },
  });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
