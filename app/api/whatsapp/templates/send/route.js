export const dynamic = 'force-dynamic';

import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { sendTemplateToClient } from '@/lib/whatsapp/send';
import { DEFAULT_TEMPLATES } from '@/lib/whatsapp/defaults';

const VALID_TYPES = Object.keys(DEFAULT_TEMPLATES);

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const body = await parseBody(request);
  const templateType = body?.templateType;
  const clientId = body?.clientId;

  if (!templateType || !VALID_TYPES.includes(templateType)) {
    return errorResponse('templateType inválido');
  }
  if (!clientId) return errorResponse('clientId é obrigatório');

  try {
    const message = await sendTemplateToClient(tenantId, {
      templateType,
      clientId,
      content: body?.content ? String(body.content).slice(0, 4000) : undefined,
    });
    return jsonResponse({ success: true, message });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
