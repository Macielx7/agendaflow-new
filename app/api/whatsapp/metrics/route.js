export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse } from '@/lib/api';
import { getOrCreateInstanceRecord } from '@/lib/whatsapp/service';
import { ensureWhatsappDefaults } from '@/lib/whatsapp/templates';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  await ensureWhatsappDefaults(tenantId);
  const instance = await getOrCreateInstanceRecord(tenantId);
  const settings = await prisma.whatsappSettings.findUnique({ where: { tenantId } });

  const [sent, failed, total, recent] = await Promise.all([
    prisma.whatsappMessage.count({ where: { tenantId, status: 'SENT' } }),
    prisma.whatsappMessage.count({ where: { tenantId, status: 'FAILED' } }),
    prisma.whatsappMessage.count({ where: { tenantId } }),
    prisma.whatsappMessage.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const automationsActive = [
    settings?.confirmationsEnabled,
    settings?.remindersEnabled,
    settings?.cancellationsEnabled,
    settings?.reschedulesEnabled,
    settings?.completionsEnabled,
  ].filter(Boolean).length;

  return jsonResponse({
    success: true,
    metrics: {
      connectionStatus: instance.status,
      phoneNumber: instance.phoneNumber,
      connectedAt: instance.connectedAt,
      lastEventAt: instance.lastEventAt,
      messagesSent: sent,
      messagesFailed: failed,
      messagesTotal: total,
      automationsActive,
      reminderHoursBefore: settings?.reminderHoursBefore ?? 24,
    },
    recentMessages: recent,
    instance,
    settings,
  });
}
