export const dynamic = 'force-dynamic';

import { jsonResponse, errorResponse } from '@/lib/api';
import { processAllReminders, processRemindersForTenant } from '@/lib/whatsapp/reminders';
import { requireTenantId } from '@/lib/tenant';

function checkCronSecret(request) {
  const secret = process.env.WHATSAPP_CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('x-cron-secret');
  const url = new URL(request.url);
  return header === secret || url.searchParams.get('secret') === secret;
}

export async function POST(request) {
  if (checkCronSecret(request)) {
    const result = await processAllReminders();
    return jsonResponse({ success: true, ...result });
  }

  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  try {
    const result = await processRemindersForTenant(tenantId);
    return jsonResponse({ success: true, ...result });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
