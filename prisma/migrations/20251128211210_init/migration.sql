/*
  Warnings:

  - A unique constraint covering the columns `[bggId,userId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Game_bggId_userId_key" ON "Game"("bggId", "userId");
