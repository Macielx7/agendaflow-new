export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeString } from '@/lib/validations';
import { jsonResponse, unauthorizedResponse, errorResponse, parseBody } from '@/lib/api';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } });
  return jsonResponse({ success: true, settings });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const body = await parseBody(request);
  if (!body?.settings || !Array.isArray(body.settings)) {
    return errorResponse('Dados inválidos');
  }

  const updates = await Promise.all(
    body.settings.map((s) =>
      prisma.setting.update({
        where: { key: s.key },
        data: { value: sanitizeString(s.value, 2000) },
      })
    )
  );

  return jsonResponse({ success: true, settings: updates });
}
