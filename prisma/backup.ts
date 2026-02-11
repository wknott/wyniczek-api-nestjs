
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data export...');

    const games = await prisma.game.findMany();
    console.log(`Exported ${games.length} games`);

    const players = await prisma.player.findMany();
    console.log(`Exported ${players.length} players`);

    const pointCategories = await prisma.pointCategory.findMany();
    console.log(`Exported ${pointCategories.length} pointCategories`);

    const results = await prisma.result.findMany();
    console.log(`Exported ${results.length} results`);

    const scores = await prisma.score.findMany();
    console.log(`Exported ${scores.length} scores`);

    const points = await prisma.point.findMany();
    console.log(`Exported ${points.length} points`);

    const data = {
        games,
        players,
        pointCategories,
        results,
        scores,
        points,
    };

    const dumpPath = path.join(__dirname, 'dump.json');
    fs.writeFileSync(dumpPath, JSON.stringify(data, null, 2));
    console.log(`Data exported successfully to ${dumpPath}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
