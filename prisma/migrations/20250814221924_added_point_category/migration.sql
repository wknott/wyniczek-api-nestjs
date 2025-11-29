/*
  Warnings:

  - You are about to drop the column `pointFields` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Score` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PointCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "PointCategory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Point" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scoreId" TEXT NOT NULL,
    "pointCategoryId" TEXT NOT NULL,
    "value" INTEGER,
    CONSTRAINT "Point_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Point_pointCategoryId_fkey" FOREIGN KEY ("pointCategoryId") REFERENCES "PointCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
CREATE TABLE "new_Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resultId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "Score_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Score_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Score" ("id", "playerId", "resultId") SELECT "id", "playerId", "resultId" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
