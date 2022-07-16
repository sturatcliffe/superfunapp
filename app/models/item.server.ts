import { User, Item, WatchStatus } from "@prisma/client";

import { prisma } from "~/services/db.server";

export type WatchListItems = Awaited<ReturnType<typeof getWatchlistItems>>;
export type { Item } from "@prisma/client";

export function getItemsCurrentlyBeingWatched() {
  return prisma.item.groupBy({
    by: ["tt", "url", "image", "title"],
    _count: {
      tt: true,
    },
    where: {
      status: {
        in: [WatchStatus.Watching],
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
          updatedAt: "desc",
        },
      },
    ],
    take: 4,
  });
}

export function getRecentlyWatchedItems() {
  return prisma.item.groupBy({
    by: ["tt", "url", "image", "title"],
    where: {
      status: {
        in: [WatchStatus.Watched],
      },
    },
    orderBy: [
      {
        _max: {
          updatedAt: "desc",
        },
      },
    ],
    take: 4,
  });
}

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

export function getWatchedItemsWithoutScore({
  userId,
}: {
  userId: User["id"];
}) {
  return prisma.item.findMany({
    where: { userId, status: WatchStatus.Watched, score: null },
  });
}

export function setItemScore({
  userId,
  itemId,
  score,
}: {
  userId: User["id"];
  itemId: Item["id"];
  score: Item["score"];
}) {
  return prisma.item.updateMany({
    where: {
      id: itemId,
      userId,
    },
    data: {
      score,
    },
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

export function markAsWatched(
  id: number,
  status: WatchStatus,
  score: number | undefined
) {
  console.log({ id, status, score });

  return prisma.item.update({
    where: {
      id,
    },
    data: {
      status,
      score,
    },
  });
}
