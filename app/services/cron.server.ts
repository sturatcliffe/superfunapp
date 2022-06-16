import type { User } from "@prisma/client";

import { prisma } from "./db.server";
import { sendMail } from "./email.server";

const daily = async () => {
  const users = await prisma.user.findMany({});
  users.map(async (user: User) => {
    const count = await prisma.message.count({
      where: {
        createdAt: {
          gt: user.lastReadMessages ?? new Date(1900, 0, 0),
        },
      },
    });

    if (count > 0) {
      const body = `
            <p>
                Hey ${user.name ?? user.email},
            </p>
            <p>
                You're missing all the super fun! There ${
                  count === 1 ? "is" : "are"
                } ${count} new message${
        count === 1 ? "" : "s"
      } waiting for you on <a href="https://superfunapp.uk/chat">SuperFunChat!</a>
            </p>
            <p>
                Toodles!
            </p>
        `;

      await sendMail(
        user.name ?? user.email,
        user.email,
        "SuperFunApp: Unread chat messages!",
        body
      );
    }
  });
};

export { daily };
