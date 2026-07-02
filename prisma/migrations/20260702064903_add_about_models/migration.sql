-- AlterTable
ALTER TABLE "gallery_items" RENAME CONSTRAINT "portfolio_items_pkey" TO "gallery_items_pkey";

-- CreateTable
CREATE TABLE "about_bios" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_bios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_bio_translations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bioId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "about_bio_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_journeys" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "about_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_journey_translations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "journeyId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "about_journey_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "about_bio_translations_bioId_locale_idx" ON "about_bio_translations"("bioId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "about_bio_translations_bioId_locale_key" ON "about_bio_translations"("bioId", "locale");

-- CreateIndex
CREATE INDEX "about_journeys_displayOrder_idx" ON "about_journeys"("displayOrder");

-- CreateIndex
CREATE INDEX "about_journey_translations_journeyId_locale_idx" ON "about_journey_translations"("journeyId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "about_journey_translations_journeyId_locale_key" ON "about_journey_translations"("journeyId", "locale");

-- AddForeignKey
ALTER TABLE "about_bio_translations" ADD CONSTRAINT "about_bio_translations_bioId_fkey" FOREIGN KEY ("bioId") REFERENCES "about_bios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_journey_translations" ADD CONSTRAINT "about_journey_translations_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "about_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
