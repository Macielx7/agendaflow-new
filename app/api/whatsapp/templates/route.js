export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { ensureWhatsappDefaults } from '@/lib/whatsapp/templates';
import { DEFAULT_TEMPLATES } from '@/lib/whatsapp/defaults';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  await ensureWhatsappDefaults(tenantId);
  const templates = await prisma.whatsappTemplate.findMany({
    where: { tenantId },
    orderBy: { type: 'asc' },
  });

  return jsonResponse({ success: true, templates, defaults: DEFAULT_TEMPLATES });
}

export async function PUT(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const body = await parseBody(request);
  const items = body?.templates;
  if (!Array.isArray(items)) return errorResponse('templates é obrigatório');

  await ensureWhatsappDefaults(tenantId);

  for (const item of items) {
    if (!item.type || !item.content) continue;
    await prisma.whatsappTemplate.upsert({
      where: { tenantId_type: { tenantId, type: item.type } },
      create: {
        tenantId,
        type: item.type,
        content: String(item.content).slice(0, 4000),
        active: item.active !== false,
      },
      update: {
        content: String(item.content).slice(0, 4000),
        active: item.active !== false,
      },
    });
  }

  const templates = await prisma.whatsappTemplate.findMany({ where: { tenantId } });
  return jsonResponse({ success: true, templates });
}
