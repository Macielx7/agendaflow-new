export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { ensureAiDefaults, syncKnowledgeToFaq } from '@/lib/ai/ensureDefaults';
import { extractKeywords } from '@/lib/ai/normalize';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  await ensureAiDefaults(tenantId);

  const items = await prisma.knowledgeBase.findMany({
    where: { tenantId },
    orderBy: { updatedAt: 'desc' },
  });

  return jsonResponse({ success: true, items });
}

export async function POST(request) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const body = await parseBody(request);
  const question = String(body?.question || '').trim();
  const answer = String(body?.answer || '').trim();

  if (!question || question.length < 3) return errorResponse('Pergunta inválida');
  if (!answer || answer.length < 3) return errorResponse('Resposta inválida');

  await ensureAiDefaults(tenantId);

  const keywords = body?.keywords
    ? JSON.stringify(Array.isArray(body.keywords) ? body.keywords : String(body.keywords).split(',').map((s) => s.trim()))
    : JSON.stringify(extractKeywords(question));

  const item = await prisma.knowledgeBase.create({
    data: {
      tenantId,
      question,
      answer,
      keywords,
      category: body?.category ? String(body.category).slice(0, 80) : null,
      isActive: body?.isActive !== false,
    },
  });

  await syncKnowledgeToFaq(tenantId, item);

  return jsonResponse({ success: true, item });
}
