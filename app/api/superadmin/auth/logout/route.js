export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { SUPER_COOKIE } from '@/lib/superAuth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SUPER_COOKIE);
  return response;
}
