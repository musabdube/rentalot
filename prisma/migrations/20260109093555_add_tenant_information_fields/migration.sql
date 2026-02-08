-- AlterTable
ALTER TABLE "RentalRequest" ADD COLUMN     "tenantEmail" TEXT,
ADD COLUMN     "tenantEmployer" TEXT,
ADD COLUMN     "tenantIncome" TEXT,
ADD COLUMN     "tenantNotes" TEXT,
ADD COLUMN     "tenantOccupation" TEXT,
ADD COLUMN     "tenantPhone" TEXT,
ADD COLUMN     "tenantReferences" TEXT;
