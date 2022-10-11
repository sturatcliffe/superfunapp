import bcrypt from "bcryptjs";
import { makeDomainFunction } from "domain-functions";
import { z } from "zod";

import { prisma } from "~/services/db.server";

export const schema = z.object({
  email: z.string(),
  password: z.string(),
  redirectTo: z.string().optional(),
  remember: z.boolean(),
});

export const mutation = makeDomainFunction(schema)(
  async ({ email, password, redirectTo, remember }) => {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        password: true,
      },
    });

    if (!user || !user.password) {
      throw new Error("Invalid e-mail address and/or password.");
    }

    const isValid = await bcrypt.compare(password, user.password.hash);

    if (!isValid) {
      throw new Error("Invalid e-mail address and/or password.");
    }

    const { id } = user;

    return { id, redirectTo, remember };
  }
);
