import { prisma } from "~/services/db.server";

export function createNotification(
  userId: number,
  message: string,
  href: string
) {
  return prisma.notification.create({
    data: {
      userId,
      message,
      href,
    },
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
