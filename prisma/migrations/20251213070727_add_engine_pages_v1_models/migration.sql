-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MED', 'HIGH');

-- AlterTable
ALTER TABLE "Engine" ADD COLUMN     "boreMm" DOUBLE PRECISION,
ADD COLUMN     "compressionRatio" DOUBLE PRECISION,
ADD COLUMN     "displacementCc" INTEGER,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "oilCapacityOz" INTEGER,
ADD COLUMN     "oilType" TEXT,
ADD COLUMN     "stockHp" DOUBLE PRECISION,
ADD COLUMN     "stockRpmLimit" INTEGER,
ADD COLUMN     "strokeMm" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "EngineSchematic" (
    "id" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineSchematic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TorqueSpec" (
    "id" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,
    "fastener" TEXT NOT NULL,
    "spec" TEXT NOT NULL,
    "unit" TEXT,
    "notes" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TorqueSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upgrade" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "hpGainMin" DOUBLE PRECISION,
    "hpGainMax" DOUBLE PRECISION,
    "rpmDelta" INTEGER,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "requires" JSONB,
    "conflicts" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upgrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineUpgrade" (
    "id" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,
    "upgradeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "affiliateUrl" TEXT NOT NULL,
    "vendor" TEXT,
    "priceHint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpgradeTool" (
    "id" TEXT NOT NULL,
    "upgradeId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpgradeTool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EngineSchematic_engineId_idx" ON "EngineSchematic"("engineId");

-- CreateIndex
CREATE INDEX "TorqueSpec_engineId_idx" ON "TorqueSpec"("engineId");

-- CreateIndex
CREATE INDEX "TorqueSpec_engineId_category_idx" ON "TorqueSpec"("engineId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Upgrade_slug_key" ON "Upgrade"("slug");

-- CreateIndex
CREATE INDEX "Upgrade_slug_idx" ON "Upgrade"("slug");

-- CreateIndex
CREATE INDEX "Upgrade_category_idx" ON "Upgrade"("category");

-- CreateIndex
CREATE INDEX "EngineUpgrade_engineId_idx" ON "EngineUpgrade"("engineId");

-- CreateIndex
CREATE INDEX "EngineUpgrade_upgradeId_idx" ON "EngineUpgrade"("upgradeId");

-- CreateIndex
CREATE UNIQUE INDEX "EngineUpgrade_engineId_upgradeId_key" ON "EngineUpgrade"("engineId", "upgradeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");

-- CreateIndex
CREATE INDEX "Tool_slug_idx" ON "Tool"("slug");

-- CreateIndex
CREATE INDEX "UpgradeTool_upgradeId_idx" ON "UpgradeTool"("upgradeId");

-- CreateIndex
CREATE INDEX "UpgradeTool_toolId_idx" ON "UpgradeTool"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "UpgradeTool_upgradeId_toolId_key" ON "UpgradeTool"("upgradeId", "toolId");

-- AddForeignKey
ALTER TABLE "EngineSchematic" ADD CONSTRAINT "EngineSchematic_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorqueSpec" ADD CONSTRAINT "TorqueSpec_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineUpgrade" ADD CONSTRAINT "EngineUpgrade_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineUpgrade" ADD CONSTRAINT "EngineUpgrade_upgradeId_fkey" FOREIGN KEY ("upgradeId") REFERENCES "Upgrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpgradeTool" ADD CONSTRAINT "UpgradeTool_upgradeId_fkey" FOREIGN KEY ("upgradeId") REFERENCES "Upgrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpgradeTool" ADD CONSTRAINT "UpgradeTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
