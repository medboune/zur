-- CreateTable
CREATE TABLE "Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "company" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "equipment" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "quantity" INTEGER,
    "configuration" TEXT,
    "deliveryLocation" TEXT,
    "neededBy" TEXT,
    "budget" TEXT,
    "notes" TEXT,
    "relatedRef" TEXT,
    "condition" TEXT,
    "itemLocation" TEXT,
    "year" TEXT,
    "askingPrice" TEXT,
    "listSummary" TEXT,
    "pastedList" TEXT,
    "attachmentName" TEXT,
    "attachmentType" TEXT,
    "attachmentSize" INTEGER,
    "attachmentPath" TEXT,
    "submissionToken" TEXT NOT NULL,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "partNumber" TEXT,
    "sector" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "conditionKey" TEXT NOT NULL,
    "conditionNote" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL,
    "lastVerifiedAt" DATETIME,
    "priceType" TEXT NOT NULL DEFAULT 'QUOTE',
    "price" TEXT,
    "currency" TEXT,
    "includesShipping" BOOLEAN NOT NULL DEFAULT false,
    "testSummary" TEXT,
    "specs" TEXT NOT NULL,
    "image" TEXT,
    "imageCaption" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "searchKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_reference_key" ON "Lead"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_submissionToken_key" ON "Lead"("submissionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_slug_key" ON "Equipment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_reference_key" ON "Equipment"("reference");

