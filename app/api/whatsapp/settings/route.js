export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { ensureWhatsappDefaults } from '@/lib/whatsapp/templates';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  await ensureWhatsappDefaults(tenantId);
  const settings = await prisma.whatsappSettings.findUnique({ where: { tenantId } });
  return jsonResponse({ success: true, settings });
}

export async function PATCH(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const body = await parseBody(request);
  if (!body) return errorResponse('Dados inválidos');

  await ensureWhatsappDefaults(tenantId);

  const data = {};
  const boolFields = [
    'confirmationsEnabled',
    'remindersEnabled',
    'cancellationsEnabled',
    'reschedulesEnabled',
    'completionsEnabled',
  ];
  boolFields.forEach((f) => {
    if (typeof body[f] === 'boolean') data[f] = body[f];
  });
  if (body.reminderHoursBefore != null) {
    const h = parseInt(body.reminderHoursBefore, 10);
    if (h >= 1 && h <= 168) data.reminderHoursBefore = h;
  }

  const settings = await prisma.whatsappSettings.update({
    where: { tenantId },
    data,
  });

  return jsonResponse({ success: true, settings });
}
