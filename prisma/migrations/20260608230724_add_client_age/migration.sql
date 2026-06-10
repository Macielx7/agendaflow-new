-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "duration" INTEGER;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "age" INTEGER;
