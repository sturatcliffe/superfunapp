// @ts-ignore
import Database from "better-sqlite3";

import { prisma } from "~/services/db.server";

export const migrateFromSQLite = async () => {
  const existingUsers = await prisma.user.findMany();

  if (!existingUsers || existingUsers.length === 0) {
    console.log("NO USERS FOUND - MIGRATING...");
    const db = new Database(
      "prisma/data.db",
      { readonly: true },
      (err: any) => {
        if (err) {
          console.error(err.message);
        }

        console.log("Connected to local data.db file");
      }
    );

    const users = db
      .prepare("SELECT * FROM User u JOIN Password p ON u.id = P.userId")
      .all();

    const items = db.prepare("SELECT * FROM Item").all();

    console.log(
      `FOUND ${users.length} USERS AND ${items.length} ITEMS TO MIGRATE...`
    );
    await Promise.all(
      users.map(async (user: any) => {
        const { name, email, hash, createdAt, updatedAt } = user;
        await prisma.user.create({
          data: {
            name,
            email,
            password: {
              create: {
                hash,
              },
            },
            createdAt: new Date(createdAt).toISOString(),
            updatedAt: new Date(updatedAt).toISOString(),
          },
        });
      })
    );

    await Promise.all(
      items.map(async (item: any) => {
        const {
          url,
          title,
          description,
          image,
          watched,
          createdAt,
          updatedAt,
          userId,
          createdById,
        } = item;

        await prisma.item.create({
          data: {
            url,
            title,
            description,
            image,
            watched: watched === 0 ? false : true,
            createdAt: new Date(createdAt).toISOString(),
            updatedAt: new Date(updatedAt).toISOString(),
            user: {
              connect: { email: users.find((u: any) => u.id === userId).email },
            },
            createdBy: {
              connect: {
                email: users.find((u: any) => u.id === createdById).email,
              },
            },
          },
        });
      })
    );

    console.log("MIGRATION COMPLETE!");
  } else {
    console.log("NEW DB ALREADY CONTAINS DATA - SKIPPING MIGRATION...");
  }
};
