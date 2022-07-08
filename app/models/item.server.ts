import type { User, Item, WatchStatus } from "@prisma/client";

import { prisma } from "~/services/db.server";

export type WatchListItems = Awaited<ReturnType<typeof getWatchlistItems>>;
export type { Item } from "@prisma/client";

export function getWatchlistItems({ userId }: { userId: User["id"] }) {
  return prisma.item.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      image: true,
      userId: true,
      status: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertItem({
  tt,
  title,
  description,
  url,
  image,
  userId,
  createdById,
}: Pick<Item, "tt" | "title" | "description" | "url" | "image"> & {
  userId: User["id"];
  createdById: User["id"];
}) {
  const existingItem = await prisma.item.findFirst({
    where: {
      tt,
      userId,
    },
  });

  if (!existingItem) {
    return prisma.item.create({
      data: {
        tt,
        title,
        description,
        url,
        image,
        user: {
          connect: {
            id: userId,
          },
        },
        createdBy: {
          connect: {
            id: createdById,
          },
        },
      },
    });
  }
}

export function deleteItem({
  id,
  userId,
}: Pick<Item, "id"> & { userId: User["id"] }) {
  return prisma.item.deleteMany({
    where: { id, userId },
  });
}

export function markAsWatched(id: number, status: WatchStatus) {
  return prisma.item.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}
