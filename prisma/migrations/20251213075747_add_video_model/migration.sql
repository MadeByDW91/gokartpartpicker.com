-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('INSTALL', 'TEARDOWN', 'TUNING', 'SAFETY');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "category" "VideoCategory" NOT NULL,
    "tags" JSONB,
    "engineIds" JSONB,
    "upgradeIds" JSONB,
    "partIds" JSONB,
    "guideIds" JSONB,
    "timestamps" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_youtubeId_key" ON "Video"("youtubeId");

-- CreateIndex
CREATE INDEX "Video_category_idx" ON "Video"("category");

-- CreateIndex
CREATE INDEX "Video_youtubeId_idx" ON "Video"("youtubeId");
