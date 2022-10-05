// export async function updateProfile(
//     id: User["id"],
//     name: User["name"],
//     email: User["email"],
//     phone: User["phone"],
//     watchlistEmail: boolean,
//     chatEmail: boolean,
//     usersEmail: boolean,
//     watchlistSms: boolean,
//     chatSms: boolean,
//     usersSms: boolean,
//     watchlistPush: boolean,
//     chatPush: boolean,
//     usersPush: boolean
//   ) {
//     return prisma.user.update({
//       where: {
//         id: id,
//       },
//       data: {
//         name,
//         email,
//         phone,
//         preferences: {
//           upsert: [
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Watchlist"],
//                   method: NotificationMethod["Email"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Watchlist"],
//                 method: NotificationMethod["Email"],
//                 enabled: watchlistEmail,
//               },
//               update: {
//                 event: NotificationEvent["Watchlist"],
//                 method: NotificationMethod["Email"],
//                 enabled: watchlistEmail,
//               },
//             },
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Chat"],
//                   method: NotificationMethod["Email"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Chat"],
//                 method: NotificationMethod["Email"],
//                 enabled: chatEmail,
//               },
//               update: {
//                 event: NotificationEvent["Chat"],
//                 method: NotificationMethod["Email"],
//                 enabled: chatEmail,
//               },
//             },
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Users"],
//                   method: NotificationMethod["Email"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Users"],
//                 method: NotificationMethod["Email"],
//                 enabled: usersEmail,
//               },
//               update: {
//                 event: NotificationEvent["Users"],
//                 method: NotificationMethod["Email"],
//                 enabled: usersEmail,
//               },
//             },
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Watchlist"],
//                   method: NotificationMethod["SMS"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Watchlist"],
//                 method: NotificationMethod["SMS"],
//                 enabled: watchlistSms,
//               },
//               update: {
//                 event: NotificationEvent["Watchlist"],
//                 method: NotificationMethod["SMS"],
//                 enabled: watchlistSms,
//               },
//             },
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Chat"],
//                   method: NotificationMethod["SMS"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Chat"],
//                 method: NotificationMethod["SMS"],
//                 enabled: chatSms,
//               },
//               update: {
//                 event: NotificationEvent["Chat"],
//                 method: NotificationMethod["SMS"],
//                 enabled: chatSms,
//               },
//             },
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Users"],
//                   method: NotificationMethod["SMS"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Users"],
//                 method: NotificationMethod["SMS"],
//                 enabled: usersSms,
//               },
//               update: {
//                 event: NotificationEvent["Users"],
//                 method: NotificationMethod["SMS"],
//                 enabled: usersSms,
//               },
//             },
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Watchlist"],
//                   method: NotificationMethod["Push"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Watchlist"],
//                 method: NotificationMethod["Push"],
//                 enabled: watchlistPush,
//               },
//               update: {
//                 event: NotificationEvent["Watchlist"],
//                 method: NotificationMethod["Push"],
//                 enabled: watchlistPush,
//               },
//             },
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Chat"],
//                   method: NotificationMethod["Push"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Chat"],
//                 method: NotificationMethod["Push"],
//                 enabled: chatPush,
//               },
//               update: {
//                 event: NotificationEvent["Chat"],
//                 method: NotificationMethod["Push"],
//                 enabled: chatPush,
//               },
//             },
//             {
//               where: {
//                 userId_method_event: {
//                   userId: id,
//                   event: NotificationEvent["Users"],
//                   method: NotificationMethod["Push"],
//                 },
//               },
//               create: {
//                 event: NotificationEvent["Users"],
//                 method: NotificationMethod["Push"],
//                 enabled: usersPush,
//               },
//               update: {
//                 event: NotificationEvent["Users"],
//                 method: NotificationMethod["Push"],
//                 enabled: usersPush,
//               },
//             },
//           ],
//         },
//       },
//     });
//   }

import { makeDomainFunction } from "domain-functions";
import { z } from "zod";

import { prisma } from "~/services/db.server";

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});

const envSchema = z.object({
  id: z.number().positive(),
});

const updateProfile = makeDomainFunction(
  schema,
  envSchema
)(async ({ name, email, phone }, { id }) =>
  prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone,
    },
  })
);

export default updateProfile;
