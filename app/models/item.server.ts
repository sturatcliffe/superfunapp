import type { User, Item } from "@prisma/client";

import { prisma } from "~/db.server";

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
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function createItem({
  title,
  description,
  url,
  image,
  userId,
}: Pick<Item, "title" | "description" | "url" | "image"> & {
  userId: User["id"];
}) {
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
    },
  });
}

export function deleteItem({
  id,
  userId,
}: Pick<Item, "id"> & { userId: User["id"] }) {
  return prisma.item.deleteMany({
    where: { id, userId },
  });
}
