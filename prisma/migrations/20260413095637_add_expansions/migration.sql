-- DropForeignKey
ALTER TABLE "Point" DROP CONSTRAINT "Point_pointCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "PointCategory" DROP CONSTRAINT "PointCategory_gameId_fkey";

-- AlterTable
ALTER TABLE "PointCategory" ADD COLUMN     "expansionId" TEXT,
ALTER COLUMN "gameId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Expansion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Expansion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExpansionToResult" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ExpansionToResult_AB_unique" ON "_ExpansionToResult"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpansionToResult_B_index" ON "_ExpansionToResult"("B");

-- AddForeignKey
ALTER TABLE "PointCategory" ADD CONSTRAINT "PointCategory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddConstraint (XOR: exactly one of gameId/expansionId must be set)
ALTER TABLE "PointCategory" ADD CONSTRAINT "PointCategory_source_xor" CHECK (("gameId" IS NULL) != ("expansionId" IS NULL));

-- AddForeignKey
ALTER TABLE "PointCategory" ADD CONSTRAINT "PointCategory_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expansion" ADD CONSTRAINT "Expansion_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_pointCategoryId_fkey" FOREIGN KEY ("pointCategoryId") REFERENCES "PointCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpansionToResult" ADD CONSTRAINT "_ExpansionToResult_A_fkey" FOREIGN KEY ("A") REFERENCES "Expansion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpansionToResult" ADD CONSTRAINT "_ExpansionToResult_B_fkey" FOREIGN KEY ("B") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
