-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "shortTermAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortTermMaxNights" INTEGER,
ADD COLUMN     "shortTermMinNights" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "shortTermPricePerNight" INTEGER;

-- CreateTable
CREATE TABLE "ShortTermBooking" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "totalNights" INTEGER NOT NULL,
    "pricePerNight" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "guestNotes" TEXT,
    "hostNotes" TEXT,
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortTermBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShortTermBooking_propertyId_idx" ON "ShortTermBooking"("propertyId");

-- CreateIndex
CREATE INDEX "ShortTermBooking_guestId_idx" ON "ShortTermBooking"("guestId");

-- CreateIndex
CREATE INDEX "ShortTermBooking_hostId_idx" ON "ShortTermBooking"("hostId");

-- CreateIndex
CREATE INDEX "ShortTermBooking_status_idx" ON "ShortTermBooking"("status");

-- CreateIndex
CREATE INDEX "ShortTermBooking_checkIn_idx" ON "ShortTermBooking"("checkIn");

-- CreateIndex
CREATE INDEX "ShortTermBooking_checkOut_idx" ON "ShortTermBooking"("checkOut");

-- AddForeignKey
ALTER TABLE "ShortTermBooking" ADD CONSTRAINT "ShortTermBooking_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortTermBooking" ADD CONSTRAINT "ShortTermBooking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortTermBooking" ADD CONSTRAINT "ShortTermBooking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
