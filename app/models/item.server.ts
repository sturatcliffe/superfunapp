import type { User, Item } from "@prisma/client";

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
      watched: true,
      userId: true,
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
  title,
  description,
  url,
  image,
  userId,
  createdById,
}: Pick<Item, "title" | "description" | "url" | "image"> & {
  userId: User["id"];
  createdById: User["id"];
}) {
  const existingItem = await prisma.item.findFirst({
    where: {
      title,
      userId,
    },
  });

  if (!existingItem) {
    return prisma.item.create({
      data: {
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

export function markAsWatched(id: number) {
  return prisma.item.update({
    where: {
      id,
    },
    data: {
      watched: true,
    },
  });
}
