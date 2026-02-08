-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "featureRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featureRequestedAt" TIMESTAMP(3),
ADD COLUMN     "pinRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinRequestedAt" TIMESTAMP(3);
