/**
 * Skrypt migrujący kategorie punktów z gry głównej do odpowiednich dodatków.
 *
 * Dla każdego dodatku gry szuka kategorii o tej samej nazwie co kategoria gry głównej.
 * Jeśli znajdzie dopasowanie:
 *   - wyniki, w których ktokolwiek zdobył > 0 pkt w tej kategorii,
 *     zostają powiązane z danym dodatkiem (_ExpansionToResult)
 *   - rekordy Point migrują ze starej kategorii gry do kategorii dodatku
 *   - stara kategoria gry zostaje usunięta
 *
 * Użycie:
 *   node prisma/scripts/migrate-expansion-categories.ts <nazwa-gry>           # dry run
 *   node prisma/scripts/migrate-expansion-categories.ts <nazwa-gry> --apply   # wykonaj
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const isDryRun = !args.includes("--apply");
const gameName = args.find((a) => !a.startsWith("--"));

async function main() {
    if (!gameName) {
        console.error(
            "Użycie: node prisma/scripts/migrate-expansion-categories.ts <nazwa-gry> [--apply]",
        );
        process.exit(1);
    }

    console.log(`Tryb:  ${isDryRun ? "DRY RUN – bez zmian (dodaj --apply, żeby wykonać)" : "APPLY – zmiany zostaną zapisane"}`);
    console.log(`Gra:   "${gameName}"\n`);

    const game = await prisma.game.findFirst({
        where: { name: { equals: gameName, mode: "insensitive" } },
        include: {
            pointCategories: { orderBy: { order: "asc" } },
            expansions: {
                where: { deletedAt: null },
                include: { pointCategories: { orderBy: { order: "asc" } } },
            },
        },
    });

    if (!game) {
        console.error(`Nie znaleziono gry zawierającej "${gameName}".`);
        process.exit(1);
    }

    console.log(`Znaleziono: "${game.name}"`);
    console.log(`Kategorie gry:  ${game.pointCategories.map((c: any) => c.name).join(", ") || "(brak)"}`);
    console.log(`Dodatki:        ${game.expansions.map((e: any) => e.name).join(", ") || "(brak)"}\n`);

    if (game.expansions.length === 0) {
        console.log("Brak dodatków. Dodaj je najpierw przez UI.");
        return;
    }

    let totalLinked = 0;
    let totalMigrated = 0;
    let totalDeleted = 0;

    for (const expansion of game.expansions) {
        console.log(`╔══ Dodatek: "${expansion.name}"`);

        const matchedPairs: { gameCategory: any; expansionCategory: any }[] = [];

        for (const expansionCategory of expansion.pointCategories) {
            const gameCategory = game.pointCategories.find(
                (c: any) => c.name.toLowerCase() === expansionCategory.name.toLowerCase(),
            );

            if (!gameCategory) {
                console.log(`║  [POMIŃ]  "${expansionCategory.name}" – brak pasującej kategorii w grze`);
                continue;
            }

            matchedPairs.push({ gameCategory, expansionCategory });

            // Wyniki z co najmniej jednym punktem > 0 w tej kategorii
            const nonZeroPoints = await prisma.point.findMany({
                where: { pointCategoryId: gameCategory.id, value: { gt: 0 } },
                select: { score: { select: { resultId: true } } },
            });
            const resultIds = [...new Set(nonZeroPoints.map((p: any) => p.score.resultId))];

            const totalPoints = await prisma.point.count({
                where: { pointCategoryId: gameCategory.id },
            });

            console.log(`║`);
            console.log(`║  Kategoria:  "${gameCategory.name}"  →  "${expansionCategory.name}"`);
            console.log(`║  Wyniki do powiązania z dodatkiem:  ${resultIds.length}`);
            console.log(`║  Rekordy Point do migracji:         ${totalPoints}`);

            totalLinked += resultIds.length;
            totalMigrated += totalPoints;
            totalDeleted += 1;

            if (!isDryRun) {
                await prisma.$transaction(async (tx: any) => {
                    if (resultIds.length > 0) {
                        await tx.expansion.update({
                            where: { id: expansion.id },
                            data: {
                                results: { connect: (resultIds as string[]).map((id) => ({ id })) },
                            },
                        });
                    }

                    await tx.point.updateMany({
                        where: { pointCategoryId: gameCategory.id },
                        data: { pointCategoryId: expansionCategory.id },
                    });

                    await tx.pointCategory.delete({ where: { id: gameCategory.id } });
                });

                console.log(`║  ✓ Wykonano`);
            }
        }

        if (matchedPairs.length === 0) {
            console.log(`║  Brak kategorii do migracji dla tego dodatku.`);
        }

        console.log(`╚${"═".repeat(50)}\n`);
    }

    console.log("════════════════════════════════════════════════════");
    console.log(`Podsumowanie:`);
    console.log(`  Wyniki do powiązania z dodatkami:  ${totalLinked}`);
    console.log(`  Rekordy Point do migracji:         ${totalMigrated}`);
    console.log(`  Kategorie gry do usunięcia:        ${totalDeleted}`);
    console.log("════════════════════════════════════════════════════");

    if (isDryRun) {
        console.log("\nDRY RUN – żadne zmiany nie zostały zapisane.");
        console.log("Uruchom z --apply, żeby wykonać migrację.");
    } else {
        console.log("\nMigracja zakończona pomyślnie.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
