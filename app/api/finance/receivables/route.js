export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { ensureFinanceDefaults } from '@/lib/finance/ensureDefaults.js';
import { resolveStatus, serializeReceivable, toDecimal } from '@/lib/finance/utils.js';
import { calculateCommissionForReceivable } from '@/lib/finance/commissions.js';
import { notifyPaymentConfirmation, triggerFinanceWhatsAppAsync } from '@/lib/finance/whatsapp.js';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  await ensureFinanceDefaults(tenantId);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const where = { tenantId };
  if (status && status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { clientCpf: { contains: search.replace(/\D/g, '') } },
    ];
  }

  const items = await prisma.financialReceivable.findMany({
    where,
    include: { client: true, category: true },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  const serialized = items.map((r) => {
    const statusResolved = resolveStatus(r.amount, r.paidAmount, r.dueDate, r.status);
    return serializeReceivable({ ...r, status: statusResolved });
  });

  return jsonResponse({ success: true, receivables: serialized });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  if (!body.clientName || !body.description || !body.amount || !body.dueDate) {
    return errorResponse('Cliente, procedimento, valor e vencimento são obrigatórios');
  }

  let clientName = body.clientName;
  let clientCpf = body.clientCpf || null;
  if (body.clientId) {
    const client = await prisma.client.findFirst({ where: { id: body.clientId, tenantId } });
    if (client) {
      clientName = client.name;
      clientCpf = client.cpf;
    }
  }

  const amount = toDecimal(body.amount);
  const paidAmount = toDecimal(body.paidAmount || 0);
  const status = resolveStatus(amount, paidAmount, body.dueDate, body.status || 'PENDING');

  const item = await prisma.financialReceivable.create({
    data: withTenantData(tenantId, {
      clientId: body.clientId || null,
      clientName,
      clientCpf,
      description: body.description,
      serviceId: body.serviceId || null,
      categoryId: body.categoryId || null,
      dentistId: body.dentistId || null,
      dentistName: body.dentistName || null,
      amount,
      paidAmount,
      dueDate: new Date(body.dueDate),
      paidAt: body.paidAt ? new Date(body.paidAt) : status === 'PAID' ? new Date() : null,
      paymentMethod: body.paymentMethod || null,
      status,
      notes: body.notes || null,
    }),
    include: { client: true, category: true },
  });

  if (status === 'PAID') {
    await calculateCommissionForReceivable(tenantId, item);
    triggerFinanceWhatsAppAsync(notifyPaymentConfirmation, tenantId, item);
  }

  return jsonResponse({ success: true, receivable: serializeReceivable(item) });
}
