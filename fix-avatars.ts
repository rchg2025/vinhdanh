import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      image: { contains: "drive.google.com/uc" }
    }
  });

  for (const user of users) {
    if (user.image) {
      const match = user.image.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const fileId = match[1];
        await prisma.user.update({
          where: { id: user.id },
          data: { image: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400` }
        });
        console.log("Updated", user.id);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
