-- CreateTable
CREATE TABLE "faq_groups" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "faq_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_questions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "faq_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_translations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,

    CONSTRAINT "faq_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faq_groups_displayOrder_idx" ON "faq_groups"("displayOrder");

-- CreateIndex
CREATE INDEX "faq_questions_groupId_displayOrder_idx" ON "faq_questions"("groupId", "displayOrder");

-- CreateIndex
CREATE INDEX "faq_translations_questionId_locale_idx" ON "faq_translations"("questionId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "faq_translations_questionId_locale_key" ON "faq_translations"("questionId", "locale");

-- AddForeignKey
ALTER TABLE "faq_questions" ADD CONSTRAINT "faq_questions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "faq_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_translations" ADD CONSTRAINT "faq_translations_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "faq_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
