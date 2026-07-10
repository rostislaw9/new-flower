-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "reviews_visible_createdAt_idx" ON "reviews"("visible", "createdAt");
