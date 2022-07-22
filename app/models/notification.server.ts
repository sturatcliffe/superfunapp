import { prisma } from "~/services/db.server";
import { pusher } from "~/services/pusher.server";

export async function createNotification(
  userId: number,
  message: string,
  href: string
) {
  const { id, read } = await prisma.notification.create({
    data: {
      userId,
      message,
      href,
    },
  });

  pusher.sendToUser(userId.toString(), "notification", {
    id,
    userId,
    message,
    href,
    read,
  });
}

export function getUnreadNotificationsByUserId(userId: number) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
  });
}

export function markNotificationRead(userId: number, id: number) {
  return prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      read: true,
    },
  });
}

export function markAllNotificationsRead(userId: number) {
  return prisma.notification.updateMany({
    where: {
      userId,
    },
    data: {
      read: true,
    },
  });
}
