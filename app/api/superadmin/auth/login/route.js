export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSuperToken, attachSuperAuthCookie, verifyPassword } from '@/lib/superAuth';
import { validateLoginBody } from '@/lib/validations';
import { logSystem } from '@/lib/superLog';
import { errorResponse, parseBody } from '@/lib/api';

export async function POST(request) {
  const body = await parseBody(request);
  if (!body) return errorResponse('Dados inválidos');
  const validation = validateLoginBody(body);
  if (!validation.valid) return errorResponse(validation.error);
  const { email, password } = validation.data;
  const admin = await prisma.superAdmin.findUnique({ where: { email } });
  if (!admin || !admin.active) return errorResponse('Credenciais inválidas', 401);
  if (!(await verifyPassword(password, admin.password))) {
    return errorResponse('Credenciais inválidas', 401);
  }
  const token = await createSuperToken({
    superAdminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  await logSystem({ superAdminId: admin.id, action: 'LOGIN', details: admin.email });
  const response = NextResponse.json({
    success: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  });
  return attachSuperAuthCookie(response, token);
}
