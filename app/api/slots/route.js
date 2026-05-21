export const dynamic = 'force-dynamic';

import { getAvailableSlots } from '@/lib/slots';
import { jsonResponse, errorResponse } from '@/lib/api';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) return errorResponse('Informe a data (YYYY-MM-DD)');

  const result = await getAvailableSlots(date);

  return jsonResponse({
    success: true,
    date,
    slots: result.slots,
    allSlots: result.allSlots,
    bookedTimes: result.bookedTimes,
    message: result.message,
  });
}
