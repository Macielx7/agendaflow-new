export const dynamic = 'force-dynamic';

import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { sendWhatsappMessage } from '@/lib/whatsapp/send';

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const body = await parseBody(request);
  if (!body?.phone || !body?.content) {
    return errorResponse('phone e content são obrigatórios');
  }

  try {
    const message = await sendWhatsappMessage({
      tenantId,
      phone: body.phone,
      clientName: body.clientName,
      type: 'MANUAL',
      content: String(body.content).slice(0, 4000),
    });
    return jsonResponse({ success: true, message });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
