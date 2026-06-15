import prisma from '@/lib/prisma';
import { normalizeText, extractKeywords } from './normalize';
import { buildSystemFaqEntries } from './defaults';
import { buildKnowledgeEntries } from './knowledgeTemplates';

async function getClinicInfo(tenantId) {
  const settings = await prisma.setting.findMany({ where: { tenantId } });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const schedules = await prisma.schedule.findMany({
    where: { tenantId, active: true },
    orderBy: { dayOfWeek: 'asc' },
  });

  const weekday = schedules.find((s) => s.dayOfWeek >= 1 && s.dayOfWeek <= 5);
  const saturday = schedules.find((s) => s.dayOfWeek === 6);

  return {
    endereco: map.company_address || 'Entre em contato para mais informações.',
    telefone: map.company_phone || '',
    email: map.company_email || '',
    empresa: map.company_name || 'Clínica',
    horaInicio: weekday?.startTime || '08:00',
    horaFim: weekday?.endTime || '18:00',
    sabado: saturday?.active
      ? `Sábado das ${saturday.startTime} às ${saturday.endTime}.`
      : 'Não atendemos aos sábados.',
  };
}

async function ensureKnowledgeDefaults(tenantId) {
  const count = await prisma.knowledgeBase.count({ where: { tenantId } });
  if (count > 0) return;

  const clinic = await getClinicInfo(tenantId);
  const services = await prisma.service.findMany({
    where: { tenantId, active: true },
    orderBy: { sortOrder: 'asc' },
  });

  const entries = buildKnowledgeEntries(tenantId, clinic, services);
  for (const entry of entries) {
    const knowledge = await prisma.knowledgeBase.create({ data: entry });
    await syncKnowledgeToFaq(tenantId, knowledge);
  }
}

export async function ensureAiDefaults(tenantId) {
  let settings = await prisma.aiSettings.findUnique({ where: { tenantId } });
  if (!settings) {
    settings = await prisma.aiSettings.create({
      data: { tenantId },
    });
  }

  const systemCount = await prisma.faqEntry.count({
    where: { tenantId, isSystem: true },
  });

  if (systemCount === 0) {
    const clinic = await getClinicInfo(tenantId);
    const entries = buildSystemFaqEntries(tenantId, clinic);
    await prisma.faqEntry.createMany({ data: entries });
  }

  await ensureKnowledgeDefaults(tenantId);

  return settings;
}

export async function syncKnowledgeToFaq(tenantId, knowledge) {
  const keywords = knowledge.keywords
    ? typeof knowledge.keywords === 'string'
      ? knowledge.keywords
      : JSON.stringify(knowledge.keywords)
    : JSON.stringify(extractKeywords(knowledge.question));

  const existing = await prisma.faqEntry.findFirst({
    where: { tenantId, knowledgeId: knowledge.id },
  });

  const data = {
    question: knowledge.question,
    answer: knowledge.answer,
    normalizedQuestion: normalizeText(knowledge.question),
    keywords,
    isActive: knowledge.isActive,
    isSystem: false,
  };

  if (existing) {
    return prisma.faqEntry.update({ where: { id: existing.id }, data });
  }

  return prisma.faqEntry.create({
    data: { tenantId, knowledgeId: knowledge.id, ...data },
  });
}

export async function removeFaqByKnowledgeId(tenantId, knowledgeId) {
  await prisma.faqEntry.deleteMany({ where: { tenantId, knowledgeId } });
}
