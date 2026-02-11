const { PrismaClient } = require("@prisma/client");
const players = require("./test.users.json");
const games = require("./test.games.json");
const results = require("./test.results.json");

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Players
  console.log(`Processing ${players.length} players...`);
  for (const p of players) {
    await prisma.player.upsert({
      where: { id: p._id.$oid },
      update: {
        name: p.name,
        userId: "user_3131o9cnVMCzOj05gh2EjqD0u26",
      },
      create: {
        id: p._id.$oid,
        name: p.name,
        userId: "user_3131o9cnVMCzOj05gh2EjqD0u26",
      },
    });
  }

  // 2. Games
  console.log(`Processing ${games.length} games...`);
  for (const game of games) {
    const gameId = game._id.$oid;

    // Upsert game
    await prisma.game.upsert({
      where: { id: gameId },
      update: {
        name: game.name,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        bggId: game.bggId,
        imgUrl: game.imgUrl,
        thumbnailUrl: game.thumbnailUrl,
        userId: "user_3131o9cnVMCzOj05gh2EjqD0u26",
      },
      create: {
        id: gameId,
        name: game.name,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        bggId: game.bggId,
        imgUrl: game.imgUrl,
        thumbnailUrl: game.thumbnailUrl,
        userId: "user_3131o9cnVMCzOj05gh2EjqD0u26",
      },
    });

    // Check and create categories if missing
    const existingCategories = await prisma.pointCategory.count({
      where: { gameId: gameId },
    });

    if (existingCategories === 0) {
      if (Array.isArray(game.pointFields) && game.pointFields.length > 0) {
        for (const fieldName of game.pointFields) {
          await prisma.pointCategory.create({
            data: {
              name: fieldName,
              gameId: gameId,
            },
          });
        }
      } else {
        await prisma.pointCategory.create({
          data: {
            name: "Punkty",
            gameId: gameId,
          },
        });
      }
    }
  }

  // 3. Results
  console.log(`Processing ${results.length} results...`);
  for (const r of results) {
    const resultId = r._id.$oid;

    // Check if result exists
    const existingResult = await prisma.result.findUnique({
      where: { id: resultId },
    });

    if (!existingResult) {
      const resultRecord = await prisma.result.create({
        data: {
          id: resultId,
          gameId: r.game.$oid,
          createdAt: new Date(r.date.$date),
          playingTime: r.playingTime,
          userId: "user_3131o9cnVMCzOj05gh2EjqD0u26",
        },
      });

      for (const s of r.scores) {
        const scoreRecord = await prisma.score.create({
          data: {
            id: s._id.$oid,
            resultId: resultRecord.id,
            playerId: s.user.$oid,
          },
        });

        const categories = await prisma.pointCategory.findMany({
          where: { gameId: r.game.$oid },
          orderBy: { id: "asc" },
        });

        // Create Point entries
        if (categories.length > 1) {
          for (let i = 0; i < categories.length; i++) {
            const pointValue = i < s.points.length ? s.points[i] : null;

            await prisma.point.create({
              data: {
                scoreId: scoreRecord.id,
                pointCategoryId: categories[i].id,
                value: pointValue || 0,
              },
            });
          }
        } else if (categories.length === 1) {
          const pointValue = s.points.length > 0 ? s.points[0] : null;

          await prisma.point.create({
            data: {
              scoreId: scoreRecord.id,
              pointCategoryId: categories[0].id,
              value: pointValue || 0,
            },
          });
        }
      }
    }
  }
}

main()
  .then(() => {
    console.log("✅ Migration completed");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
