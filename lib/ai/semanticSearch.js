import prisma from '@/lib/prisma';
import { rankBySimilarity } from './similarity';
import { parseKeywords } from './defaults';
import { normalizeText } from './normalize';

export async function searchKnowledge(tenantId, query, { limit = 5 } = {}) {
  const [knowledge, faqs] = await Promise.all([
    prisma.knowledgeBase.findMany({ where: { tenantId, isActive: true } }),
    prisma.faqEntry.findMany({ where: { tenantId, isActive: true } }),
  ]);

  const items = [
    ...knowledge.map((k) => ({
      id: k.id,
      source: 'knowledge',
      question: k.question,
      answer: k.answer,
      keywords: parseKeywords(k.keywords),
      category: k.category,
    })),
    ...faqs.map((f) => ({
      id: f.id,
      source: 'faq',
      question: f.question,
      answer: f.answer,
      keywords: parseKeywords(f.keywords),
      category: null,
    })),
  ];

  const ranked = rankBySimilarity(query, items, {
    getText: (item) => item.question,
    getKeywords: (item) => item.keywords,
  });

  return ranked.slice(0, limit);
}

export async function searchServices(tenantId, query) {
  const services = await prisma.service.findMany({
    where: { tenantId, active: true },
  });

  const ranked = rankBySimilarity(query, services, {
    getText: (s) => `${s.name} ${s.description || ''}`,
    getKeywords: (s) => [s.name],
  });

  return ranked.slice(0, 3);
}

export function enrichQueryWithContext(query, context) {
  if (!context?.lastTopic) return query;
  const q = normalizeText(query);
  const shortFollowUp = ['quanto', 'custa', 'valor', 'preco', 'faz', 'tem', 'trabalha', 'aceita'].some((w) =>
    q.includes(w)
  );
  if (shortFollowUp && q.split(' ').length <= 4) {
    return `${context.lastTopic} ${query}`;
  }
  return query;
}
