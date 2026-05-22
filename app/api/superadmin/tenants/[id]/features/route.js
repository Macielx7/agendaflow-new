export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/superRequire';
import { logSystem } from '@/lib/superLog';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET(request, { params }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  const features = await prisma.featurePermission.findMany({
    where: { tenantId: params.id },
  });
  return jsonResponse({ success: true, features });
}

export async function PUT(request, { params }) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;
  const body = await parseBody(request);
  if (!body?.features || !Array.isArray(body.features)) {
    return errorResponse('Dados inválidos');
  }

  for (const f of body.features) {
    await prisma.featurePermission.upsert({
      where: { tenantId_module: { tenantId: params.id, module: f.module } },
      update: { enabled: f.enabled !== false, limit: f.limit ?? null },
      create: {
        tenantId: params.id,
        module: f.module,
        enabled: f.enabled !== false,
        limit: f.limit ?? null,
      },
    });
  }

  await logSystem({
    superAdminId: session.superAdminId,
    tenantId: params.id,
    action: 'FEATURES_UPDATED',
  });

  const features = await prisma.featurePermission.findMany({ where: { tenantId: params.id } });
  return jsonResponse({ success: true, features });
}
