import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TARGET_USER = process.env.TARGET_CLERK_USER_ID;

if (!TARGET_USER) {
  throw new Error('TARGET_CLERK_USER_ID env var is required');
}

async function main() {
  await prisma.game.updateMany({ data: { userId: TARGET_USER } });
  await prisma.player.updateMany({ data: { userId: TARGET_USER } });
  await prisma.result.updateMany({ data: { userId: TARGET_USER } });
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
