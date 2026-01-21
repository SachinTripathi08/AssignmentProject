-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT
);

-- CreateTable
CREATE TABLE "EmailJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "EmailJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
