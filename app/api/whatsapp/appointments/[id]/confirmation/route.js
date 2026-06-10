export const dynamic = 'force-dynamic';

import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse } from '@/lib/api';
import { sendConfirmationForAppointment } from '@/lib/whatsapp/send';

export async function POST(_request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const appointmentId = params?.id;
  if (!appointmentId) return errorResponse('ID do agendamento é obrigatório');

  try {
    const message = await sendConfirmationForAppointment(tenantId, appointmentId);
    return jsonResponse({ success: true, message });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
