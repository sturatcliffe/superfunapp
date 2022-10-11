import bcrypt from "bcryptjs";
import { makeDomainFunction } from "domain-functions";
import { z } from "zod";

import { prisma } from "~/services/db.server";

export const schema = z.object({
  name: z
    .string()
    .nonempty("Please enter your name.")
    .min(2, "Name must be 2 characters or more in length."),
  email: z
    .string()
    .nonempty("Please enter your e-mail address")
    .email("Please enter a valid e-mail address."),
  password: z
    .string()
    .nonempty("Please enter your desired password.")
    .min(8, "Your password must be 8 characters or more in length."),
  confirmPassword: z.string().nonempty("Please confirm your desired password."),
  redirectTo: z.string().optional(),
});

const refinedSchema = schema
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Both passwords must match.",
    path: ["confirmPassword"],
  })
  .refine(async ({ email }) => await validateUniqueEmail(email), {
    message: "This e-mail address is already in use.",
    path: ["email"],
  });

export const validateUniqueEmail = async (email: string) => {
  return (await prisma.user.findUnique({ where: { email } })) === null;
};

export const mutation = makeDomainFunction(refinedSchema)(
  async ({ name, email, password, redirectTo }) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { id } = await prisma.user.create({
      data: {
        email,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
        name,
      },
    });

    return { id, redirectTo };
  }
);
