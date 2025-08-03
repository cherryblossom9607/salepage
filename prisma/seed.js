import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcryptjs from "bcryptjs";
async function main() {
  const inituser = await prisma.user.upsert({
    where: { email: "tester@email.com" },
    update: {},
    create: {
      email: "tester@email.com",
      name: "tester",
      password: await bcryptjs.hashSync("123456", 10),
    },
  });

  console.log({ inituser });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
