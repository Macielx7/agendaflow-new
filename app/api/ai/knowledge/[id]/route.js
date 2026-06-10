export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { requireTenantId } from '@/lib/tenant';
import { jsonResponse, errorResponse, parseBody } from '@/lib/api';
import { syncKnowledgeToFaq, removeFaqByKnowledgeId } from '@/lib/ai/ensureDefaults';
import { extractKeywords } from '@/lib/ai/normalize';

export async function PATCH(request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const existing = await prisma.knowledgeBase.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Item não encontrado', 404);

  const body = await parseBody(request);
  const data = {};

  if (body?.question != null) {
    const q = String(body.question).trim();
    if (q.length < 3) return errorResponse('Pergunta inválida');
    data.question = q;
  }
  if (body?.answer != null) {
    const a = String(body.answer).trim();
    if (a.length < 3) return errorResponse('Resposta inválida');
    data.answer = a;
  }
  if (body?.category != null) data.category = String(body.category).slice(0, 80) || null;
  if (typeof body?.isActive === 'boolean') data.isActive = body.isActive;
  if (body?.keywords != null) {
    data.keywords = JSON.stringify(
      Array.isArray(body.keywords) ? body.keywords : String(body.keywords).split(',').map((s) => s.trim())
    );
  } else if (data.question) {
    data.keywords = JSON.stringify(extractKeywords(data.question));
  }

  const item = await prisma.knowledgeBase.update({
    where: { id: params.id },
    data,
  });

  await syncKnowledgeToFaq(tenantId, item);

  return jsonResponse({ success: true, item });
}

export async function DELETE(_request, { params }) {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const existing = await prisma.knowledgeBase.findFirst({
    where: { id: params.id, tenantId },
  });
  if (!existing) return errorResponse('Item não encontrado', 404);

  await removeFaqByKnowledgeId(tenantId, params.id);
  await prisma.knowledgeBase.delete({ where: { id: params.id } });

  return jsonResponse({ success: true });
}
