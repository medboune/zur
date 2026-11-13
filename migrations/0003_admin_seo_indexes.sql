-- Final optimization phase: admin accounts, SEO overrides, query indexes.

-- CreateTable (admin console accounts; password is a PBKDF2-SHA256 hash)
CREATE TABLE "AdminUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex (equipment catalog queries: listing pages, sector filters, search)
CREATE INDEX "Equipment_isPublished_lastVerifiedAt_idx" ON "Equipment"("isPublished", "lastVerifiedAt");
CREATE INDEX "Equipment_isPublished_sector_manufacturer_idx" ON "Equipment"("isPublished", "sector", "manufacturer");
CREATE INDEX "Equipment_searchKey_idx" ON "Equipment"("searchKey");

-- CreateIndex (requests console: type/status filters + newest-first)
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_type_idx" ON "Lead"("type");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- AlterTable (optional per-listing SEO overrides; auto-generated when empty)
ALTER TABLE "Equipment" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Equipment" ADD COLUMN "seoDescription" TEXT;
