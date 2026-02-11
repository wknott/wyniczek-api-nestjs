
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data restore...');

    const dumpPath = path.join(__dirname, 'dump.json');
    if (!fs.existsSync(dumpPath)) {
        throw new Error(`Backup file not found at ${dumpPath}`);
    }

    const data = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

    // Define the order of insertion to respect foreign key constraints
    // 1. Independent entities or parents
    if (data.games?.length) {
        console.log(`Restoring ${data.games.length} games...`);
        await prisma.game.createMany({ data: data.games, skipDuplicates: true });
    }

    if (data.players?.length) {
        console.log(`Restoring ${data.players.length} players...`);
        await prisma.player.createMany({ data: data.players, skipDuplicates: true });
    }

    // 2. Entities depending on Game
    if (data.pointCategories?.length) {
        console.log(`Restoring ${data.pointCategories.length} pointCategories...`);
        await prisma.pointCategory.createMany({ data: data.pointCategories, skipDuplicates: true });
    }

    if (data.results?.length) {
        console.log(`Restoring ${data.results.length} results...`);
        await prisma.result.createMany({ data: data.results, skipDuplicates: true });
    }

    // 3. Entities depending on Result and Player
    if (data.scores?.length) {
        console.log(`Restoring ${data.scores.length} scores...`);
        await prisma.score.createMany({ data: data.scores, skipDuplicates: true });
    }

    // 4. Entities depending on Score and PointCategory
    if (data.points?.length) {
        console.log(`Restoring ${data.points.length} points...`);
        await prisma.point.createMany({ data: data.points, skipDuplicates: true });
    }

    console.log('Data restoration completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
