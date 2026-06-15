export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { splitInstallments, toDecimal } from '@/lib/finance/utils.js';

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;
  const body = await parseBody(request);

  const budget = await prisma.financialBudget.findFirst({
    where: { id: params.id, tenantId },
    include: { client: true },
  });
  if (!budget) return errorResponse('Orçamento não encontrado', 404);

  if (body.approve && budget.status === 'DRAFT') {
    const client = budget.client;
    const parts = splitInstallments(
      parseFloat(budget.finalAmount),
      budget.installmentsCount,
      body.firstDueDate || new Date().toISOString().slice(0, 10),
    );

    await prisma.$transaction(async (tx) => {
      await tx.financialBudget.update({
        where: { id: budget.id },
        data: { status: 'APPROVED' },
      });

      const installmentData = parts.map((p) => ({
        tenantId,
        budgetId: budget.id,
        clientId: client.id,
        clientName: client.name,
        clientCpf: client.cpf,
        description: `${budget.title} - Parcela ${p.number}/${parts.length}`,
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
          description: budget.title,
          budgetId: budget.id,
          dentistId: budget.dentistId,
          dentistName: budget.dentistName,
          amount: parseFloat(budget.finalAmount),
          paidAmount: 0,
          dueDate: parts[0].dueDate,
          status: 'PENDING',
        },
      });

      const installments = await tx.financialInstallment.findMany({ where: { budgetId: budget.id } });
      for (const inst of installments) {
        await tx.financialInstallment.update({
          where: { id: inst.id },
          data: { receivableId: receivable.id },
        });
      }
    });
  } else if (body.status === 'CANCELLED') {
    await prisma.financialBudget.update({
      where: { id: budget.id },
      data: { status: 'CANCELLED' },
    });
  }

  const updated = await prisma.financialBudget.findUnique({
    where: { id: budget.id },
    include: { client: true, items: true, installments: { orderBy: { number: 'asc' } } },
  });

  return jsonResponse({ success: true, budget: updated });
}
