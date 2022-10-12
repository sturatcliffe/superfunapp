import bcrypt from "bcryptjs";
import { makeDomainFunction } from "domain-functions";
import { z } from "zod";

import { prisma } from "~/services/db.server";

export const schema = z.object({
  email: z.string(),
  otp: z.number(),
  password: z.string().nonempty().min(8),
  confirmPassword: z.string().nonempty().min(8),
});

const refinedSchema = schema.refine(
  ({ password, confirmPassword }) => password === confirmPassword,
  {
    message: "Both passwords must match.",
    path: ["confirmPassword"],
  }
);

const envSchema = z.object({
  sessionEmail: z.string(),
  sessionOtp: z.number(),
});

export const mutation = makeDomainFunction(
  refinedSchema,
  envSchema
)(async ({ email, otp, password }, { sessionEmail, sessionOtp }) => {
  console.log({ email, otp });
  console.log({ sessionEmail, sessionOtp });

  if (email !== sessionEmail || otp !== sessionOtp) {
    throw Error("Invalid OTP");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) throw Error("User does not exist");

  const { id: userId } = user;

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.password.update({
    where: {
      userId,
    },
    data: {
      hash: hashedPassword,
    },
  });

  return { userId };
});
