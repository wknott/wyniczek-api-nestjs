const { PrismaClient } = require("@prisma/client");
const players = require("./players.json");
const games = require("./games.json");
const results = require("./results.json");

const prisma = new PrismaClient();

async function main() {
  for (const p of players) {
    await prisma.player.create({
      data: {
        id: p._id.$oid,
        name: p.name,
        userId: "user_3131o9cnVMCzOj05gh2EjqD0u26",
      },
    });
  }

  for (const game of games) {
    const gameRecord = await prisma.game.create({
      data: {
        id: game._id.$oid,
        name: game.name,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        bggId: game.bggId,
        imgUrl: game.imgUrl,
        thumbnailUrl: game.thumbnailUrl,
        userId: "user_3131o9cnVMCzOj05gh2EjqD0u26",
      },
    });

    if (Array.isArray(game.pointFields) && game.pointFields.length > 0) {
      for (const fieldName of game.pointFields) {
        await prisma.pointCategory.create({
          data: {
            name: fieldName,
            gameId: gameRecord.id,
          },
        });
      }
    } else {
      await prisma.pointCategory.create({
        data: {
          name: "Punkty",
          gameId: gameRecord.id,
        },
      });
    }
  }

  for (const r of results) {
    const resultRecord = await prisma.result.create({
      data: {
        id: r._id.$oid,
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

      // Create Point entries for all categories, even if value is 0, null, or undefined
      if (categories.length > 1) {
        for (let i = 0; i < categories.length; i++) {
          // Get the value from s.points[i], or null if it doesn't exist
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
        // For single category, use first point value or null
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

main()
  .then(() => {
    console.log("✅ Migration completed");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
