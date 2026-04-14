-- CreateTable
CREATE TABLE "ResultImage" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResultImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResultImage" ADD CONSTRAINT "ResultImage_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
