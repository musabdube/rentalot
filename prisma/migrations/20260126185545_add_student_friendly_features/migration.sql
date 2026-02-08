-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "campusName" TEXT,
ADD COLUMN     "distanceToCampus" DOUBLE PRECISION,
ADD COLUMN     "nearCampus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicTransportNearby" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sharedRoomAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studentFriendly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studyFriendly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "utilitiesIncluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walkingDistance" BOOLEAN NOT NULL DEFAULT false;
