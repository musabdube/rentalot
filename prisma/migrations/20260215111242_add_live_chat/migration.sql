-- CreateEnum
CREATE TYPE "LiveChatStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "LiveChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "status" "LiveChatStatus" NOT NULL DEFAULT 'OPEN',
    "subject" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveChatMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL,
    "senderRole" "UserRole" NOT NULL,
    "content" TEXT NOT NULL,
    "isAdminMessage" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveChat_userId_idx" ON "LiveChat"("userId");

-- CreateIndex
CREATE INDEX "LiveChat_status_idx" ON "LiveChat"("status");

-- CreateIndex
CREATE INDEX "LiveChat_lastMessageAt_idx" ON "LiveChat"("lastMessageAt");

-- CreateIndex
CREATE INDEX "LiveChat_createdAt_idx" ON "LiveChat"("createdAt");

-- CreateIndex
CREATE INDEX "LiveChatMessage_chatId_idx" ON "LiveChatMessage"("chatId");

-- CreateIndex
CREATE INDEX "LiveChatMessage_createdAt_idx" ON "LiveChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "LiveChatMessage_read_idx" ON "LiveChatMessage"("read");

-- AddForeignKey
ALTER TABLE "LiveChat" ADD CONSTRAINT "LiveChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveChatMessage" ADD CONSTRAINT "LiveChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "LiveChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
