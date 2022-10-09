import { NotificationEvent, NotificationMethod } from "@prisma/client";
import { makeDomainFunction } from "domain-functions";
import { phone as parsePhone } from "phone";
import { z } from "zod";

import { prisma } from "~/services/db.server";

export const schema = z.object({
  name: z.string().min(1, "You must provide your name."),
  email: z
    .string()
    .min(1, "You must provide your e-mail address")
    .email("Please check that you have entered a valid e-mail address."),
  phone: z
    .string()
    .optional()
    .refine((arg) => (arg?.length ? parsePhone(arg).isValid : true), {
      message:
        "Please check that you have entered a valid phone number with country code.",
    }),
  watchlistEmail: z.boolean(),
  chatEmail: z.boolean(),
  usersEmail: z.boolean(),
  watchlistSms: z.boolean(),
  chatSms: z.boolean(),
  usersSms: z.boolean(),
  watchlistPush: z.boolean(),
  chatPush: z.boolean(),
  usersPush: z.boolean(),
});

export const envSchema = z.object({
  id: z.number().positive(),
});

export const mutation = makeDomainFunction(
  schema,
  envSchema
)(
  async (
    {
      name,
      email,
      phone,
      watchlistEmail,
      chatEmail,
      usersEmail,
      watchlistSms,
      chatSms,
      usersSms,
      watchlistPush,
      chatPush,
      usersPush,
    },
    { id }
  ) =>
    prisma.user.update({
      where: { id },
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
    })
);
