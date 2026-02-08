-- CreateEnum
CREATE TYPE "PropertyAvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'PENDING_RENT');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "availabilityStatus" "PropertyAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE';
