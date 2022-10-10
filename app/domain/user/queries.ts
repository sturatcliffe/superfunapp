import { NotificationEvent, NotificationMethod } from "@prisma/client";
import { makeDomainFunction } from "domain-functions";
import { z } from "zod";

import { prisma } from "~/services/db.server";

export const getUserProfile = makeDomainFunction(
  z.any(),
  z.object({ id: z.number().int().positive() })
)(async (_, { id }) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      email: true,
      phone: true,
      preferences: {
        select: {
          method: true,
          event: true,
          enabled: true,
        },
      },
    },
  });

  if (!user) throw new Error(`User with ID: ${id} not found!`);

  const { name, email, phone, preferences } = user;

  return {
    id,
    name,
    email,
    phone,
    watchlistEmail: preferences.find(
      (x) =>
        x.event === NotificationEvent["Watchlist"] &&
        x.method === NotificationMethod["Email"]
    )?.enabled,
    chatEmail: preferences.find(
      (x) =>
        x.event === NotificationEvent["Chat"] &&
        x.method === NotificationMethod["Email"]
    )?.enabled,
    usersEmail: preferences.find(
      (x) =>
        x.event === NotificationEvent["Users"] &&
        x.method === NotificationMethod["Email"]
    )?.enabled,
    watchlistSms: preferences.find(
      (x) =>
        x.event === NotificationEvent["Watchlist"] &&
        x.method === NotificationMethod["SMS"]
    )?.enabled,
    chatSms: preferences.find(
      (x) =>
        x.event === NotificationEvent["Chat"] &&
        x.method === NotificationMethod["SMS"]
    )?.enabled,
    usersSms: preferences.find(
      (x) =>
        x.event === NotificationEvent["Users"] &&
        x.method === NotificationMethod["SMS"]
    )?.enabled,
    watchlistPush: preferences.find(
      (x) =>
        x.event === NotificationEvent["Watchlist"] &&
        x.method === NotificationMethod["Push"]
    )?.enabled,
    chatPush: preferences.find(
      (x) =>
        x.event === NotificationEvent["Chat"] &&
        x.method === NotificationMethod["Push"]
    )?.enabled,
    usersPush: preferences.find(
      (x) =>
        x.event === NotificationEvent["Users"] &&
        x.method === NotificationMethod["Push"]
    )?.enabled,
  };
});
