import prisma from '@/lib/prisma';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './defaults.js';

export async function ensureFinanceDefaults(tenantId) {
  const existing = await prisma.financialCategory.count({ where: { tenantId } });
  if (existing > 0) return;

  const data = [
    ...INCOME_CATEGORIES.map((c) => ({
      tenantId,
      name: c.name,
      slug: c.slug,
      type: 'INCOME',
      isSystem: true,
    })),
    ...EXPENSE_CATEGORIES.map((c) => ({
      tenantId,
      name: c.name,
      slug: c.slug,
      type: 'EXPENSE',
      isSystem: true,
    })),
  ];

  await prisma.financialCategory.createMany({ data });
}
