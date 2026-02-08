-- CreateTable
CREATE TABLE "ViewingSlot" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ViewingSlot_propertyId_idx" ON "ViewingSlot"("propertyId");

-- CreateIndex
CREATE INDEX "ViewingSlot_date_idx" ON "ViewingSlot"("date");

-- AddForeignKey
ALTER TABLE "ViewingSlot" ADD CONSTRAINT "ViewingSlot_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
