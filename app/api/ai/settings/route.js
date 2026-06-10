export const dynamic = 'force-dynamic';

import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import prisma from '@/lib/prisma';
import { ensureAiDefaults } from '@/lib/ai/ensureDefaults';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const settings = await ensureAiDefaults(tenantId);
  return jsonResponse({ success: true, settings });
}

export async function PATCH(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const body = await parseBody(request);
  if (!body) return errorResponse('Dados inválidos');

  await ensureAiDefaults(tenantId);

  const data = {};
  if (typeof body.enabled === 'boolean') data.enabled = body.enabled;
  if (typeof body.autoReplyEnabled === 'boolean') data.autoReplyEnabled = body.autoReplyEnabled;
  if (typeof body.allowCancellations === 'boolean') data.allowCancellations = body.allowCancellations;
  if (typeof body.allowReschedules === 'boolean') data.allowReschedules = body.allowReschedules;
  if (typeof body.transferToHuman === 'boolean') data.transferToHuman = body.transferToHuman;
  if (body.confidenceThreshold != null) {
    const t = Number(body.confidenceThreshold);
    if (!Number.isNaN(t) && t >= 0.1 && t <= 1) data.confidenceThreshold = t;
  }

  const settings = await prisma.aiSettings.update({
    where: { tenantId },
    data,
  });

  return jsonResponse({ success: true, settings });
}
