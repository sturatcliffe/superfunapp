import { User, Item, WatchStatus } from "@prisma/client";

import { prisma } from "~/services/db.server";

export type WatchListItems = Awaited<ReturnType<typeof getWatchlistItems>>;
export type { Item } from "@prisma/client";

export function getMostPopularItems() {
  return prisma.item.groupBy({
    by: ["tt", "url", "image", "title"],
    _count: {
      tt: true,
    },
    orderBy: [
      {
        _count: {
          tt: "desc",
        },
      },
      {
        _max: {
          createdAt: "desc",
        },
      },
    ],
    take: 4,
  });
}

export function getMostWatchedItems() {
  return prisma.item.groupBy({
    by: ["tt", "url", "image", "title"],
    where: {
      status: {
        in: [WatchStatus["Watched"]],
      },
    },
    orderBy: [
      {
        _count: {
          tt: "desc",
        },
      },
      {
        _max: {
          createdAt: "desc",
        },
      },
    ],
    take: 4,
  });
}

export function getMostRecentItems() {
  return prisma.item.findMany({
    select: {
      image: true,
      title: true,
      url: true,
    },
    distinct: ["tt"],
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });
}

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
