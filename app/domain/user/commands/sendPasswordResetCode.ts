import { makeDomainFunction } from "domain-functions";
import { z } from "zod";

import { prisma } from "~/services/db.server";
import { sendMail } from "~/services/email.server";

export const schema = z.object({
  email: z.string().nonempty().email(),
});

export const mutation = makeDomainFunction(schema)(async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { name: true },
  });

  if (!user) return {};

  const { name } = user;

  const otp = Math.floor(100000 + Math.random() * 900000);

  const body = `
    <p>Hi ${name},</p>
    <p>Your OTP for resetting your password is: <b>${otp}</b>. This OTP will expire in 5 minutes.</p>
    <p>If you didn't request this password reset OTP, well, we don't really care!</p>
    <p>Toodles!</p>
  `;

  await sendMail(name, email, "SuperFunApp: Reset your password", body);

  return {
    email,
    otp,
  };
});
