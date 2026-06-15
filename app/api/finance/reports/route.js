export const dynamic = 'force-dynamic';

import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';
import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse } from '@/lib/api';
import { resolveStatus } from '@/lib/finance/utils.js';

export async function GET(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'revenue';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const start = from ? parseISO(from) : startOfMonth(new Date());
  const end = to ? parseISO(to) : endOfMonth(new Date());

  const [receivables, payables, commissions] = await Promise.all([
    prisma.financialReceivable.findMany({ where: { tenantId }, include: { category: true } }),
    prisma.financialPayable.findMany({ where: { tenantId }, include: { category: true } }),
    prisma.financialCommission.findMany({ where: { tenantId } }),
  ]);

  const paidReceivables = receivables.filter((r) => {
    const status = resolveStatus(r.amount, r.paidAmount, r.dueDate, r.status);
    return (status === 'PAID' || status === 'PARTIAL') && r.paidAt && r.paidAt >= start && r.paidAt <= end;
  });

  const paidPayables = payables.filter((p) => {
    const status = resolveStatus(p.amount, p.paidAmount, p.dueDate, p.status);
    return (status === 'PAID' || status === 'PARTIAL') && p.paidAt && p.paidAt >= start && p.paidAt <= end;
  });

  const revenue = paidReceivables.reduce((s, r) => s + parseFloat(r.paidAmount || 0), 0);
  const expenses = paidPayables.reduce((s, p) => s + parseFloat(p.paidAmount || 0), 0);

  let data = [];
  let columns = [];

  switch (type) {
    case 'revenue':
      columns = ['Data', 'Cliente', 'Procedimento', 'Categoria', 'Valor'];
      data = paidReceivables.map((r) => [
        format(r.paidAt, 'dd/MM/yyyy'),
        r.clientName,
        r.description,
        r.category?.name || '-',
        parseFloat(r.paidAmount || 0).toFixed(2),
      ]);
      break;
    case 'expenses':
      columns = ['Data', 'Descrição', 'Fornecedor', 'Categoria', 'Valor'];
      data = paidPayables.map((p) => [
        format(p.paidAt, 'dd/MM/yyyy'),
        p.description,
        p.supplier || '-',
        p.category?.name || '-',
        parseFloat(p.paidAmount || 0).toFixed(2),
      ]);
      break;
    case 'profit':
      columns = ['Indicador', 'Valor'];
      data = [
        ['Receitas', revenue.toFixed(2)],
        ['Despesas', expenses.toFixed(2)],
        ['Lucro', (revenue - expenses).toFixed(2)],
      ];
      break;
    case 'commissions':
      columns = ['Mês', 'Dentista', 'Base', '%', 'Comissão'];
      data = commissions
        .filter((c) => {
          const m = parseISO(`${c.referenceMonth}-01`);
          return m >= startOfMonth(start) && m <= endOfMonth(end);
        })
        .map((c) => [
          c.referenceMonth,
          c.dentistName,
          parseFloat(c.baseAmount).toFixed(2),
          parseFloat(c.percentage).toFixed(2),
          parseFloat(c.commissionAmount).toFixed(2),
        ]);
      break;
    case 'procedures':
      columns = ['Procedimento', 'Quantidade', 'Total'];
      const procMap = {};
      paidReceivables.forEach((r) => {
        const key = r.description;
        if (!procMap[key]) procMap[key] = { count: 0, total: 0 };
        procMap[key].count += 1;
        procMap[key].total += parseFloat(r.paidAmount || 0);
      });
      data = Object.entries(procMap).map(([name, v]) => [name, v.count, v.total.toFixed(2)]);
      break;
    default:
      return errorResponse('Tipo de relatório inválido');
  }

  return jsonResponse({
    success: true,
    report: {
      type,
      from: format(start, 'yyyy-MM-dd'),
      to: format(end, 'yyyy-MM-dd'),
      columns,
      rows: data,
      summary: { revenue, expenses, profit: revenue - expenses },
    },
  });
}
