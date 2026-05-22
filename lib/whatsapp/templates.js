import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import prisma from '@/lib/prisma';
import { DEFAULT_TEMPLATES } from './defaults';

export async function ensureWhatsappDefaults(tenantId) {
  const [settings, templates] = await Promise.all([
    prisma.whatsappSettings.findUnique({ where: { tenantId } }),
    prisma.whatsappTemplate.count({ where: { tenantId } }),
  ]);

  if (!settings) {
    await prisma.whatsappSettings.create({ data: { tenantId } });
  }

  if (templates === 0) {
    await prisma.whatsappTemplate.createMany({
      data: Object.entries(DEFAULT_TEMPLATES).map(([type, content]) => ({
        tenantId,
        type,
        content,
      })),
    });
  }
}

export async function getTemplate(tenantId, type) {
  await ensureWhatsappDefaults(tenantId);
  const row = await prisma.whatsappTemplate.findUnique({
    where: { tenantId_type: { tenantId, type } },
  });
  return row?.active ? row.content : DEFAULT_TEMPLATES[type] || '';
}

export function renderTemplate(content, vars) {
  let text = content || '';
  Object.entries(vars).forEach(([key, value]) => {
    const k = key.startsWith('{') ? key : `{${key}}`;
    text = text.split(k).join(value ?? '');
  });
  return text.trim();
}

export async function buildAppointmentVars(tenantId, appointment) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { companyName: true },
  });
  const companySetting = await prisma.setting.findUnique({
    where: { tenantId_key: { tenantId, key: 'company_name' } },
  });
  const empresa = companySetting?.value || tenant?.companyName || 'Clínica';
  const dateStr = format(new Date(appointment.date), "dd/MM/yyyy", { locale: ptBR });

  return {
    cliente: appointment.client?.name || 'Cliente',
    servico: appointment.service?.name || 'Consulta',
    data: dateStr,
    hora: appointment.time || '',
    empresa,
  };
}
