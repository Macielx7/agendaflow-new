-- CreateEnum
CREATE TYPE "FinancialCategoryType" AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "FinancialStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'PARTIAL');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'OTHER');
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'APPROVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "financial_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "FinancialCategoryType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_receivables" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientCpf" TEXT,
    "description" TEXT NOT NULL,
    "serviceId" TEXT,
    "categoryId" TEXT,
    "budgetId" TEXT,
    "dentistId" TEXT,
    "dentistName" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dueDate" DATE NOT NULL,
    "paidAt" DATE,
    "paymentMethod" "PaymentMethod",
    "status" "FinancialStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_receivables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_payables" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "supplier" TEXT,
    "categoryId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dueDate" DATE NOT NULL,
    "paidAt" DATE,
    "paymentMethod" "PaymentMethod",
    "status" "FinancialStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_payables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_budgets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "finalAmount" DECIMAL(12,2) NOT NULL,
    "installmentsCount" INTEGER NOT NULL DEFAULT 1,
    "paymentMethod" "PaymentMethod",
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "dentistId" TEXT,
    "dentistName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_budgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_budget_items" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "serviceId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "financial_budget_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_installments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "budgetId" TEXT,
    "receivableId" TEXT,
    "clientId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientCpf" TEXT,
    "description" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "paidAt" DATE,
    "paymentMethod" "PaymentMethod",
    "status" "FinancialStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_installments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_commission_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "dentistName" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "serviceId" TEXT,
    "serviceName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_commission_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_commissions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "receivableId" TEXT,
    "dentistId" TEXT NOT NULL,
    "dentistName" TEXT NOT NULL,
    "baseAmount" DECIMAL(12,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "commissionAmount" DECIMAL(12,2) NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "paidAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_commissions_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "financial_categories_tenantId_slug_key" ON "financial_categories"("tenantId", "slug");
CREATE INDEX "financial_categories_tenantId_idx" ON "financial_categories"("tenantId");
CREATE INDEX "financial_receivables_tenantId_idx" ON "financial_receivables"("tenantId");
CREATE INDEX "financial_receivables_status_idx" ON "financial_receivables"("status");
CREATE INDEX "financial_receivables_dueDate_idx" ON "financial_receivables"("dueDate");
CREATE INDEX "financial_receivables_clientId_idx" ON "financial_receivables"("clientId");
CREATE INDEX "financial_payables_tenantId_idx" ON "financial_payables"("tenantId");
CREATE INDEX "financial_payables_status_idx" ON "financial_payables"("status");
CREATE INDEX "financial_payables_dueDate_idx" ON "financial_payables"("dueDate");
CREATE INDEX "financial_budgets_tenantId_idx" ON "financial_budgets"("tenantId");
CREATE INDEX "financial_budgets_clientId_idx" ON "financial_budgets"("clientId");
CREATE INDEX "financial_budget_items_budgetId_idx" ON "financial_budget_items"("budgetId");
CREATE INDEX "financial_installments_tenantId_idx" ON "financial_installments"("tenantId");
CREATE INDEX "financial_installments_status_idx" ON "financial_installments"("status");
CREATE INDEX "financial_installments_dueDate_idx" ON "financial_installments"("dueDate");
CREATE INDEX "financial_installments_budgetId_idx" ON "financial_installments"("budgetId");
CREATE INDEX "financial_commission_rules_tenantId_idx" ON "financial_commission_rules"("tenantId");
CREATE INDEX "financial_commissions_tenantId_idx" ON "financial_commissions"("tenantId");
CREATE INDEX "financial_commissions_referenceMonth_idx" ON "financial_commissions"("referenceMonth");

-- ForeignKeys
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_receivables" ADD CONSTRAINT "financial_receivables_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_receivables" ADD CONSTRAINT "financial_receivables_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_receivables" ADD CONSTRAINT "financial_receivables_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_receivables" ADD CONSTRAINT "financial_receivables_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "financial_budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_payables" ADD CONSTRAINT "financial_payables_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_payables" ADD CONSTRAINT "financial_payables_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_budgets" ADD CONSTRAINT "financial_budgets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_budgets" ADD CONSTRAINT "financial_budgets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_budget_items" ADD CONSTRAINT "financial_budget_items_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "financial_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_installments" ADD CONSTRAINT "financial_installments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_installments" ADD CONSTRAINT "financial_installments_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "financial_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_installments" ADD CONSTRAINT "financial_installments_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "financial_receivables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_commission_rules" ADD CONSTRAINT "financial_commission_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_commissions" ADD CONSTRAINT "financial_commissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_commissions" ADD CONSTRAINT "financial_commissions_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "financial_receivables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
