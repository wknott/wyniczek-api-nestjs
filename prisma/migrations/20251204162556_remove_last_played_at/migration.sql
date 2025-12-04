/*
  Warnings:

  - You are about to drop the column `lastPlayedAt` on the `Game` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "bggId" INTEGER,
    "imgUrl" TEXT,
    "thumbnailUrl" TEXT,
    "userId" TEXT NOT NULL
);
INSERT INTO "new_Game" ("bggId", "id", "imgUrl", "maxPlayers", "minPlayers", "name", "thumbnailUrl", "userId") SELECT "bggId", "id", "imgUrl", "maxPlayers", "minPlayers", "name", "thumbnailUrl", "userId" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_bggId_userId_key" ON "Game"("bggId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
