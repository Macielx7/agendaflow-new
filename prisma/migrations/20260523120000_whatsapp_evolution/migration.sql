-- CreateEnum
CREATE TYPE "WhatsappConnectionStatus" AS ENUM ('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'EXPIRED');
CREATE TYPE "WhatsappMessageType" AS ENUM ('CONFIRMATION', 'REMINDER', 'CANCELLATION', 'RESCHEDULE', 'COMPLETION', 'MANUAL');
CREATE TYPE "WhatsappMessageStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
CREATE TYPE "WhatsappTemplateType" AS ENUM ('CONFIRMATION', 'REMINDER', 'CANCELLATION', 'RESCHEDULE', 'COMPLETION');

-- CreateTable
CREATE TABLE "whatsapp_instances" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instanceName" TEXT NOT NULL,
    "status" "WhatsappConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "phoneNumber" TEXT,
    "profileName" TEXT,
    "qrCode" TEXT,
    "qrExpiresAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "lastEventAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_instances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "whatsapp_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "confirmationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "remindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cancellationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reschedulesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "completionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderHoursBefore" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "whatsapp_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "WhatsappTemplateType" NOT NULL,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "whatsapp_messages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "clientPhone" TEXT NOT NULL,
    "clientName" TEXT,
    "type" "WhatsappMessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "status" "WhatsappMessageStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "externalId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "whatsapp_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT,
    "level" TEXT NOT NULL DEFAULT 'info',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_instances_tenantId_key" ON "whatsapp_instances"("tenantId");
CREATE UNIQUE INDEX "whatsapp_instances_instanceName_key" ON "whatsapp_instances"("instanceName");
CREATE INDEX "whatsapp_instances_status_idx" ON "whatsapp_instances"("status");

CREATE UNIQUE INDEX "whatsapp_settings_tenantId_key" ON "whatsapp_settings"("tenantId");

CREATE UNIQUE INDEX "whatsapp_templates_tenantId_type_key" ON "whatsapp_templates"("tenantId", "type");

CREATE INDEX "whatsapp_messages_tenantId_idx" ON "whatsapp_messages"("tenantId");
CREATE INDEX "whatsapp_messages_status_idx" ON "whatsapp_messages"("status");
CREATE INDEX "whatsapp_messages_createdAt_idx" ON "whatsapp_messages"("createdAt");

CREATE INDEX "whatsapp_logs_tenantId_idx" ON "whatsapp_logs"("tenantId");
CREATE INDEX "whatsapp_logs_createdAt_idx" ON "whatsapp_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "whatsapp_instances" ADD CONSTRAINT "whatsapp_instances_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_settings" ADD CONSTRAINT "whatsapp_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_logs" ADD CONSTRAINT "whatsapp_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
