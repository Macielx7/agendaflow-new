import prisma from '@/lib/prisma';

export async function getAiMetrics(tenantId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [received, responded, matched, transferred, intents] = await Promise.all([
    prisma.intentLog.count({ where: { tenantId, createdAt: { gte: since } } }),
    prisma.intentLog.count({
      where: { tenantId, createdAt: { gte: since }, response: { not: null } },
    }),
    prisma.intentLog.count({
      where: { tenantId, createdAt: { gte: since }, matched: true },
    }),
    prisma.intentLog.count({
      where: { tenantId, createdAt: { gte: since }, transferred: true },
    }),
    prisma.intentLog.groupBy({
      by: ['intent'],
      where: { tenantId, createdAt: { gte: since } },
      _count: { intent: true },
      orderBy: { _count: { intent: 'desc' } },
    }),
  ]);

  const accuracyRate = received > 0 ? Math.round((matched / received) * 100) : 0;
  const responseRate = received > 0 ? Math.round((responded / received) * 100) : 0;

  const sessions = await prisma.chatSession.count({
    where: { tenantId, status: 'HUMAN', transferredAt: { gte: since } },
  });

  const knowledgeCount = await prisma.knowledgeBase.count({
    where: { tenantId, isActive: true },
  });

  const faqCount = await prisma.faqEntry.count({
    where: { tenantId, isActive: true },
  });

  return {
    received,
    responded,
    matched,
    transferred: transferred || sessions,
    accuracyRate,
    responseRate,
    knowledgeCount,
    faqCount,
    intents: intents.map((i) => ({ intent: i.intent, count: i._count.intent })),
    periodDays: days,
  };
}
