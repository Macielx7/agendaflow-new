export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId, withTenantData } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { splitInstallments, toDecimal } from '@/lib/finance/utils.js';

function serializeBudget(b) {
  return {
    ...b,
    discount: parseFloat(b.discount),
    totalAmount: parseFloat(b.totalAmount),
    finalAmount: parseFloat(b.finalAmount),
    items: b.items?.map((i) => ({
      ...i,
      unitPrice: parseFloat(i.unitPrice),
      totalPrice: parseFloat(i.totalPrice),
    })),
    installments: b.installments?.map((i) => ({
      ...i,
      amount: parseFloat(i.amount),
    })),
  };
}

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where = { tenantId };
  if (status && status !== 'all') where.status = status;

  const budgets = await prisma.financialBudget.findMany({
    where,
    include: { client: true, items: true, installments: { orderBy: { number: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return jsonResponse({ success: true, budgets: budgets.map(serializeBudget) });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  if (!body.clientId || !body.title || !body.items?.length) {
    return errorResponse('Cliente, título e procedimentos são obrigatórios');
  }

  const client = await prisma.client.findFirst({ where: { id: body.clientId, tenantId } });
  if (!client) return errorResponse('Cliente não encontrado', 404);

  const items = body.items.map((item) => {
    const unitPrice = toDecimal(item.unitPrice);
    const qty = parseInt(item.quantity, 10) || 1;
    return {
      serviceId: item.serviceId || null,
      description: item.description,
      quantity: qty,
      unitPrice,
      totalPrice: toDecimal(unitPrice * qty),
    };
  });

  const totalAmount = toDecimal(items.reduce((s, i) => s + i.totalPrice, 0));
  const discount = toDecimal(body.discount || 0);
  const finalAmount = toDecimal(Math.max(totalAmount - discount, 0));
  const installmentsCount = Math.max(1, parseInt(body.installmentsCount, 10) || 1);
  const firstDue = body.firstDueDate || new Date().toISOString().slice(0, 10);
  const approve = body.approve === true;

  const budget = await prisma.$transaction(async (tx) => {
    const created = await tx.financialBudget.create({
      data: withTenantData(tenantId, {
        clientId: body.clientId,
        title: body.title,
        discount,
        totalAmount,
        finalAmount,
        installmentsCount,
        paymentMethod: body.paymentMethod || null,
        status: approve ? 'APPROVED' : 'DRAFT',
        dentistId: body.dentistId || null,
        dentistName: body.dentistName || null,
        notes: body.notes || null,
        items: { create: items },
      }),
      include: { items: true },
    });

    if (approve) {
      const parts = splitInstallments(finalAmount, installmentsCount, firstDue);
      const installmentData = parts.map((p) => ({
        tenantId,
        budgetId: created.id,
        clientId: client.id,
        clientName: client.name,
        clientCpf: client.cpf,
        description: `${created.title} - Parcela ${p.number}/${parts.length}`,
        number: p.number,
        amount: p.amount,
        dueDate: p.dueDate,
        status: 'PENDING',
      }));

      await tx.financialInstallment.createMany({ data: installmentData });

      const receivable = await tx.financialReceivable.create({
        data: {
          tenantId,
          clientId: client.id,
          clientName: client.name,
          clientCpf: client.cpf,
          description: created.title,
          budgetId: created.id,
          dentistId: body.dentistId || null,
          dentistName: body.dentistName || null,
          amount: finalAmount,
          paidAmount: 0,
          dueDate: parts[0].dueDate,
          status: 'PENDING',
        },
      });

      const installments = await tx.financialInstallment.findMany({
        where: { budgetId: created.id },
      });
      for (const inst of installments) {
        await tx.financialInstallment.update({
          where: { id: inst.id },
          data: { receivableId: receivable.id },
        });
      }
    }

    return tx.financialBudget.findUnique({
      where: { id: created.id },
      include: { client: true, items: true, installments: { orderBy: { number: 'asc' } } },
    });
  });

  return jsonResponse({ success: true, budget: serializeBudget(budget) });
}
