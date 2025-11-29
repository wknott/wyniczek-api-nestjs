-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "pointFields" JSONB NOT NULL,
    "bggId" INTEGER,
    "imgUrl" TEXT,
    "thumbnailUrl" TEXT,
    "userId" TEXT NOT NULL
);
INSERT INTO "new_Game" ("bggId", "id", "imgUrl", "maxPlayers", "minPlayers", "name", "pointFields", "thumbnailUrl", "userId") SELECT "bggId", "id", "imgUrl", "maxPlayers", "minPlayers", "name", "pointFields", "thumbnailUrl", "userId" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE TABLE "new_Result" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playingTime" INTEGER,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Result_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Result" ("date", "gameId", "id", "playingTime", "userId") SELECT "date", "gameId", "id", "playingTime", "userId" FROM "Result";
DROP TABLE "Result";
ALTER TABLE "new_Result" RENAME TO "Result";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
