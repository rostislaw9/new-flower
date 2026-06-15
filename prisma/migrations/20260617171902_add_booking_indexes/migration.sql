-- CreateIndex
CREATE INDEX "appointments_status_createdAt_idx" ON "appointments"("status", "createdAt");

-- CreateIndex
CREATE INDEX "appointments_email_idx" ON "appointments"("email");

-- CreateIndex
CREATE INDEX "appointments_createdAt_idx" ON "appointments"("createdAt");
