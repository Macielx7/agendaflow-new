export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const settings = await prisma.setting.findMany({ where: { tenantId }, orderBy: { key: 'asc' } });
  return jsonResponse({ success: true, settings });
}

export async function PATCH(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);
  if (!body?.settings) return errorResponse('Dados inválidos');
  const updates = await Promise.all(
    body.settings.map((s) =>
      prisma.setting.upsert({
        where: { tenantId_key: { tenantId, key: s.key } },
        update: { value: sanitizeString(s.value, 2000) },
        create: { tenantId, key: s.key, value: sanitizeString(s.value, 2000), label: s.label || s.key },
      })
    )
  );
  return jsonResponse({ success: true, settings: updates });
}
