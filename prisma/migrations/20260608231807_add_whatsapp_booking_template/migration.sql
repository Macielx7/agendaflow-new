-- AlterEnum
ALTER TYPE "WhatsappMessageType" ADD VALUE 'BOOKING';

-- AlterEnum
ALTER TYPE "WhatsappTemplateType" ADD VALUE 'BOOKING';

-- AlterTable
ALTER TABLE "whatsapp_settings" ADD COLUMN     "bookingsEnabled" BOOLEAN NOT NULL DEFAULT true;
