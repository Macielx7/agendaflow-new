-- Remove módulo IA anterior (estrutura incompatível)
DROP TABLE IF EXISTS "ai_messages" CASCADE;
DROP TABLE IF EXISTS "ai_conversations" CASCADE;
DROP TABLE IF EXISTS "ai_faq" CASCADE;
DROP TABLE IF EXISTS "ai_knowledge_base" CASCADE;
DROP TABLE IF EXISTS "ai_logs" CASCADE;
DROP TABLE IF EXISTS "ai_settings" CASCADE;

DROP TYPE IF EXISTS "AiMode";
DROP TYPE IF EXISTS "AiConversationStatus";
DROP TYPE IF EXISTS "AiMessageRole";

-- Novo módulo IA local
CREATE TABLE "ai_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "allowCancellations" BOOLEAN NOT NULL DEFAULT false,
    "allowReschedules" BOOLEAN NOT NULL DEFAULT false,
    "transferToHuman" BOOLEAN NOT NULL DEFAULT true,
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.45,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "knowledge_base" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "faq_entries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "normalizedQuestion" TEXT NOT NULL,
    "keywords" TEXT,
    "knowledgeId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_context" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientId" TEXT,
    "messages" TEXT NOT NULL,
    "lastIntent" TEXT,
    "lastTopic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_context_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "intent_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "transferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intent_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BOT',
    "transferredAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_settings_tenantId_key" ON "ai_settings"("tenantId");
CREATE INDEX "knowledge_base_tenantId_idx" ON "knowledge_base"("tenantId");
CREATE INDEX "faq_entries_tenantId_idx" ON "faq_entries"("tenantId");
CREATE INDEX "conversation_context_tenantId_idx" ON "conversation_context"("tenantId");
CREATE UNIQUE INDEX "conversation_context_tenantId_clientPhone_key" ON "conversation_context"("tenantId", "clientPhone");
CREATE INDEX "intent_logs_tenantId_idx" ON "intent_logs"("tenantId");
CREATE INDEX "intent_logs_createdAt_idx" ON "intent_logs"("createdAt");
CREATE INDEX "chat_sessions_tenantId_idx" ON "chat_sessions"("tenantId");
CREATE UNIQUE INDEX "chat_sessions_tenantId_clientPhone_key" ON "chat_sessions"("tenantId", "clientPhone");

ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "faq_entries" ADD CONSTRAINT "faq_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_context" ADD CONSTRAINT "conversation_context_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intent_logs" ADD CONSTRAINT "intent_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
