-- CreateEnum
CREATE TYPE "RoommateListingStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'REJECTED', 'INACTIVE');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "availableRooms" INTEGER,
ADD COLUMN     "sharedLivingAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tenantCanFindRoommate" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RoommateListing" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "preferredLocation" TEXT NOT NULL,
    "moveInDate" TIMESTAMP(3) NOT NULL,
    "moveOutDate" TIMESTAMP(3),
    "smoking" BOOLEAN NOT NULL DEFAULT false,
    "pets" BOOLEAN NOT NULL DEFAULT false,
    "studyFriendly" BOOLEAN NOT NULL DEFAULT false,
    "nightOwl" BOOLEAN NOT NULL DEFAULT false,
    "earlyBird" BOOLEAN NOT NULL DEFAULT false,
    "cleanliness" TEXT,
    "gender" TEXT,
    "occupation" TEXT,
    "propertyId" TEXT,
    "status" "RoommateListingStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommateListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommateMessage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoommateMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoommateListing_tenantId_idx" ON "RoommateListing"("tenantId");

-- CreateIndex
CREATE INDEX "RoommateListing_status_idx" ON "RoommateListing"("status");

-- CreateIndex
CREATE INDEX "RoommateListing_preferredLocation_idx" ON "RoommateListing"("preferredLocation");

-- CreateIndex
CREATE INDEX "RoommateListing_budget_idx" ON "RoommateListing"("budget");

-- CreateIndex
CREATE INDEX "RoommateMessage_listingId_idx" ON "RoommateMessage"("listingId");

-- CreateIndex
CREATE INDEX "RoommateMessage_senderId_idx" ON "RoommateMessage"("senderId");

-- CreateIndex
CREATE INDEX "RoommateMessage_receiverId_idx" ON "RoommateMessage"("receiverId");

-- CreateIndex
CREATE INDEX "RoommateMessage_createdAt_idx" ON "RoommateMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "RoommateListing" ADD CONSTRAINT "RoommateListing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateListing" ADD CONSTRAINT "RoommateListing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateMessage" ADD CONSTRAINT "RoommateMessage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "RoommateListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateMessage" ADD CONSTRAINT "RoommateMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateMessage" ADD CONSTRAINT "RoommateMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
