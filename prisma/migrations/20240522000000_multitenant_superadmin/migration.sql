-- CreateEnum
CREATE TYPE "SuperAdminRole" AS ENUM ('SUPER_ADMIN', 'DEVELOPER', 'SUPPORT');
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'CANCELLED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "BillingStatus" AS ENUM ('PAID', 'PENDING', 'FAILED', 'REFUNDED');

-- CreateTable plans
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "priceYearly" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "maxAppointments" INTEGER NOT NULL DEFAULT 100,
    "features" TEXT NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable tenants
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'PENDING',
    "planId" TEXT,
    "lastAccessAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable super_admins
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "SuperAdminRole" NOT NULL DEFAULT 'SUPER_ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable subscriptions
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "renewedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable billing_history
CREATE TABLE "billing_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "status" "BillingStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "billing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable feature_permissions
CREATE TABLE "feature_permissions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "limit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "feature_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable system_logs
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "superAdminId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- Default tenant for existing data
INSERT INTO "plans" ("id", "slug", "name", "description", "priceMonthly", "priceYearly", "maxUsers", "maxAppointments", "features", "active", "sortOrder", "updatedAt")
VALUES
('plan_basico', 'basico', 'Básico', 'Ideal para começar', 97, 970, 2, 100, '["agenda","clientes","servicos"]', true, 1, NOW()),
('plan_pro', 'profissional', 'Profissional', 'Para clínicas em crescimento', 197, 1970, 5, 500, '["agenda","clientes","servicos","relatorios","horarios"]', true, 2, NOW()),
('plan_premium', 'premium', 'Premium', 'Recursos completos', 397, 3970, 20, 9999, '["agenda","clientes","servicos","relatorios","horarios","api","suporte"]', true, 3, NOW());

INSERT INTO "tenants" ("id", "slug", "companyName", "ownerName", "email", "phone", "status", "planId", "updatedAt")
VALUES ('tenant_default', 'clinica-default', 'Clínica Premium', 'Administrador', 'contato@clinica.com.br', '(11) 99999-9999', 'ACTIVE', 'plan_pro', NOW());

INSERT INTO "subscriptions" ("id", "tenantId", "planId", "status", "trialEndsAt", "endsAt", "updatedAt")
VALUES ('sub_default', 'tenant_default', 'plan_pro', 'ACTIVE', NOW() + INTERVAL '14 days', NOW() + INTERVAL '1 year', NOW());

-- Add tenantId columns
ALTER TABLE "users" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "clients" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "services" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "schedules" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "holidays" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "appointments" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "settings" ADD COLUMN "tenantId" TEXT;

UPDATE "users" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "clients" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "services" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "schedules" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "holidays" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "appointments" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "settings" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;

ALTER TABLE "users" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "clients" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "services" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "schedules" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "holidays" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "appointments" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "settings" ALTER COLUMN "tenantId" SET NOT NULL;

-- Drop old uniques
DROP INDEX IF EXISTS "users_email_key";
DROP INDEX IF EXISTS "services_slug_key";
DROP INDEX IF EXISTS "schedules_dayOfWeek_key";
DROP INDEX IF EXISTS "holidays_date_key";
DROP INDEX IF EXISTS "appointments_date_time_key";
DROP INDEX IF EXISTS "settings_key_key";

-- New uniques
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");
CREATE UNIQUE INDEX "services_tenantId_slug_key" ON "services"("tenantId", "slug");
CREATE UNIQUE INDEX "schedules_tenantId_dayOfWeek_key" ON "schedules"("tenantId", "dayOfWeek");
CREATE UNIQUE INDEX "holidays_tenantId_date_key" ON "holidays"("tenantId", "date");
CREATE UNIQUE INDEX "appointments_tenantId_date_time_key" ON "appointments"("tenantId", "date", "time");
CREATE UNIQUE INDEX "settings_tenantId_key_key" ON "settings"("tenantId", "key");
CREATE UNIQUE INDEX "feature_permissions_tenantId_module_key" ON "feature_permissions"("tenantId", "module");

-- Indexes
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");
CREATE UNIQUE INDEX "subscriptions_tenantId_key" ON "subscriptions"("tenantId");
CREATE INDEX "tenants_status_idx" ON "tenants"("status");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX "billing_history_tenantId_idx" ON "billing_history"("tenantId");
CREATE INDEX "system_logs_tenantId_idx" ON "system_logs"("tenantId");
CREATE INDEX "system_logs_createdAt_idx" ON "system_logs"("createdAt");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "clients_tenantId_idx" ON "clients"("tenantId");
CREATE INDEX "appointments_tenantId_idx" ON "appointments"("tenantId");

-- ForeignKeys
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feature_permissions" ADD CONSTRAINT "feature_permissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "settings" ADD CONSTRAINT "settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
