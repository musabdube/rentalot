-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleteRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleteRequestedAt" TIMESTAMP(3);
