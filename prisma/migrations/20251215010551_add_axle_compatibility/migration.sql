-- CreateEnum
CREATE TYPE "AxleType" AS ENUM ('LIVE', 'DEAD');

-- CreateEnum
CREATE TYPE "AxlePartCategory" AS ENUM ('BEARING', 'SPROCKET', 'HUB', 'BRAKE_ROTOR', 'BRAKE_CALIPER', 'WHEEL', 'HARDWARE');

-- CreateEnum
CREATE TYPE "CompatibilityStatus" AS ENUM ('FITS', 'FITS_WITH_NOTES', 'NOT_COMPATIBLE');

-- CreateTable
CREATE TABLE "AxlePart" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "AxlePartCategory" NOT NULL,
    "specs" JSONB NOT NULL,
    "affiliateUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AxlePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AxleCompatibilityRule" (
    "id" TEXT NOT NULL,
    "axlePartId" TEXT NOT NULL,
    "axleType" "AxleType" NOT NULL,
    "minAxleDiameter" DOUBLE PRECISION,
    "maxAxleDiameter" DOUBLE PRECISION,
    "keywayWidth" DOUBLE PRECISION,
    "status" "CompatibilityStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AxleCompatibilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AxlePart_slug_key" ON "AxlePart"("slug");

-- CreateIndex
CREATE INDEX "AxlePart_slug_idx" ON "AxlePart"("slug");

-- CreateIndex
CREATE INDEX "AxlePart_category_idx" ON "AxlePart"("category");

-- CreateIndex
CREATE INDEX "AxlePart_isActive_idx" ON "AxlePart"("isActive");

-- CreateIndex
CREATE INDEX "AxleCompatibilityRule_axlePartId_idx" ON "AxleCompatibilityRule"("axlePartId");

-- CreateIndex
CREATE INDEX "AxleCompatibilityRule_axleType_idx" ON "AxleCompatibilityRule"("axleType");

-- CreateIndex
CREATE INDEX "AxleCompatibilityRule_status_idx" ON "AxleCompatibilityRule"("status");

-- AddForeignKey
ALTER TABLE "AxleCompatibilityRule" ADD CONSTRAINT "AxleCompatibilityRule_axlePartId_fkey" FOREIGN KEY ("axlePartId") REFERENCES "AxlePart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
