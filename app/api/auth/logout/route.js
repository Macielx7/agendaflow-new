export const dynamic = 'force-dynamic';

import { removeAuthCookie } from '@/lib/auth';
import { jsonResponse } from '@/lib/api';

export async function POST() {
  await removeAuthCookie();
  return jsonResponse({ success: true });
}
