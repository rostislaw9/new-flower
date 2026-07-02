/*
Warnings:

- You are about to drop the column `year` on the `about_journey_translations` table. All the data in the column will be lost.
- Added the required column `year` to the `about_journeys` table without a default value. This is not possible if the table is not empty.

*/
-- Add year column with a temporary default so existing rows don't fail
ALTER TABLE "about_journeys"
ADD COLUMN "year" TEXT NOT NULL DEFAULT '';

-- Copy year from en translations to journeys
UPDATE "about_journeys" j
SET "year" = t."year"
FROM "about_journey_translations" t
WHERE t."journeyId" = j."id" AND t."locale" = 'en';

-- Drop the year column from translations
ALTER TABLE "about_journey_translations" DROP COLUMN "year";
