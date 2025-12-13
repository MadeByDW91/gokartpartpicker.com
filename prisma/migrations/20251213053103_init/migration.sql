-- CreateTable
CREATE TABLE "Engine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "baseHpMin" DOUBLE PRECISION NOT NULL,
    "baseHpMax" DOUBLE PRECISION NOT NULL,
    "stockRpm" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "hpGainMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hpGainMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rpmLimitDelta" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartCompatibility" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,

    CONSTRAINT "PartCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 999,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorOffer" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "shippingUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "affiliateUrl" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT,
    "estimatedTimeMinutes" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideStep" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "warning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideEngine" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,

    CONSTRAINT "GuideEngine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidePart" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,

    CONSTRAINT "GuidePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "engineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoTemplateStep" (
    "id" TEXT NOT NULL,
    "todoTemplateId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoTemplateStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoTemplatePart" (
    "id" TEXT NOT NULL,
    "todoTemplateId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,

    CONSTRAINT "TodoTemplatePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "engineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildPart" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "vendorOfferId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildTodoItem" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildTodoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Engine_slug_key" ON "Engine"("slug");

-- CreateIndex
CREATE INDEX "Engine_slug_idx" ON "Engine"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Part_slug_key" ON "Part"("slug");

-- CreateIndex
CREATE INDEX "Part_slug_idx" ON "Part"("slug");

-- CreateIndex
CREATE INDEX "Part_category_idx" ON "Part"("category");

-- CreateIndex
CREATE INDEX "PartCompatibility_partId_idx" ON "PartCompatibility"("partId");

-- CreateIndex
CREATE INDEX "PartCompatibility_engineId_idx" ON "PartCompatibility"("engineId");

-- CreateIndex
CREATE UNIQUE INDEX "PartCompatibility_partId_engineId_key" ON "PartCompatibility"("partId", "engineId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

-- CreateIndex
CREATE INDEX "Vendor_priority_idx" ON "Vendor"("priority");

-- CreateIndex
CREATE INDEX "VendorOffer_partId_idx" ON "VendorOffer"("partId");

-- CreateIndex
CREATE INDEX "VendorOffer_vendorId_idx" ON "VendorOffer"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");

-- CreateIndex
CREATE INDEX "Guide_slug_idx" ON "Guide"("slug");

-- CreateIndex
CREATE INDEX "GuideStep_guideId_idx" ON "GuideStep"("guideId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideStep_guideId_stepNumber_key" ON "GuideStep"("guideId", "stepNumber");

-- CreateIndex
CREATE INDEX "GuideEngine_guideId_idx" ON "GuideEngine"("guideId");

-- CreateIndex
CREATE INDEX "GuideEngine_engineId_idx" ON "GuideEngine"("engineId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideEngine_guideId_engineId_key" ON "GuideEngine"("guideId", "engineId");

-- CreateIndex
CREATE INDEX "GuidePart_guideId_idx" ON "GuidePart"("guideId");

-- CreateIndex
CREATE INDEX "GuidePart_partId_idx" ON "GuidePart"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "GuidePart_guideId_partId_key" ON "GuidePart"("guideId", "partId");

-- CreateIndex
CREATE INDEX "TodoTemplate_engineId_idx" ON "TodoTemplate"("engineId");

-- CreateIndex
CREATE INDEX "TodoTemplateStep_todoTemplateId_idx" ON "TodoTemplateStep"("todoTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "TodoTemplateStep_todoTemplateId_stepNumber_key" ON "TodoTemplateStep"("todoTemplateId", "stepNumber");

-- CreateIndex
CREATE INDEX "TodoTemplatePart_todoTemplateId_idx" ON "TodoTemplatePart"("todoTemplateId");

-- CreateIndex
CREATE INDEX "TodoTemplatePart_partId_idx" ON "TodoTemplatePart"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "TodoTemplatePart_todoTemplateId_partId_key" ON "TodoTemplatePart"("todoTemplateId", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreProduct_sku_key" ON "StoreProduct"("sku");

-- CreateIndex
CREATE INDEX "StoreProduct_sku_idx" ON "StoreProduct"("sku");

-- CreateIndex
CREATE INDEX "BuildPart_buildId_idx" ON "BuildPart"("buildId");

-- CreateIndex
CREATE INDEX "BuildPart_partId_idx" ON "BuildPart"("partId");

-- CreateIndex
CREATE INDEX "BuildTodoItem_buildId_idx" ON "BuildTodoItem"("buildId");

-- AddForeignKey
ALTER TABLE "PartCompatibility" ADD CONSTRAINT "PartCompatibility_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartCompatibility" ADD CONSTRAINT "PartCompatibility_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOffer" ADD CONSTRAINT "VendorOffer_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOffer" ADD CONSTRAINT "VendorOffer_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideStep" ADD CONSTRAINT "GuideStep_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideEngine" ADD CONSTRAINT "GuideEngine_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideEngine" ADD CONSTRAINT "GuideEngine_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidePart" ADD CONSTRAINT "GuidePart_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidePart" ADD CONSTRAINT "GuidePart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoTemplate" ADD CONSTRAINT "TodoTemplate_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoTemplateStep" ADD CONSTRAINT "TodoTemplateStep_todoTemplateId_fkey" FOREIGN KEY ("todoTemplateId") REFERENCES "TodoTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoTemplatePart" ADD CONSTRAINT "TodoTemplatePart_todoTemplateId_fkey" FOREIGN KEY ("todoTemplateId") REFERENCES "TodoTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoTemplatePart" ADD CONSTRAINT "TodoTemplatePart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildPart" ADD CONSTRAINT "BuildPart_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildPart" ADD CONSTRAINT "BuildPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildPart" ADD CONSTRAINT "BuildPart_vendorOfferId_fkey" FOREIGN KEY ("vendorOfferId") REFERENCES "VendorOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildTodoItem" ADD CONSTRAINT "BuildTodoItem_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;
