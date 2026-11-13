-- CreateTable (abuse limiter for public endpoints)
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "windowStart" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1
);
