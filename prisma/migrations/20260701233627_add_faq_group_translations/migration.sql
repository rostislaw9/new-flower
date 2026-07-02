-- CreateTable
CREATE TABLE "faq_group_translations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    CONSTRAINT "faq_group_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faq_group_translations_groupId_locale_idx" ON "faq_group_translations" ("groupId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "faq_group_translations_groupId_locale_key" ON "faq_group_translations" ("groupId", "locale");

-- AddForeignKey
ALTER TABLE "faq_group_translations"
ADD CONSTRAINT "faq_group_translations_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "faq_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing titles into translations (English)
INSERT INTO
    "faq_group_translations" (
        "id",
        "createdAt",
        "updatedAt",
        "groupId",
        "locale",
        "title"
    )
SELECT gen_random_uuid (), NOW(), NOW(), "id", 'en', "title"
FROM "faq_groups"
WHERE
    "title" IS NOT NULL;

-- AlterTable
ALTER TABLE "faq_groups" DROP COLUMN "title";
