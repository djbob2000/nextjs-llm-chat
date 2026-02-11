// import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import prisma from "../src/lib/prisma";

async function main() {
  const email = process.env.DEFAULT_USER_EMAIL || "admin@llmchat.local";
  const password = process.env.DEFAULT_USER_PASSWORD || "changeme123";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      passwordHash,
    },
  });

  console.log(`Seed finished. Default user created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
