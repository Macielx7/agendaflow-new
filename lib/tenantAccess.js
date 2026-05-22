import prisma from './prisma';

const ACTIVE_SUB = ['TRIAL', 'ACTIVE'];

export async function assertTenantAccess(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: true },
  });
  if (!tenant) return { ok: false, error: 'Conta não encontrada' };
  if (tenant.status === 'SUSPENDED') return { ok: false, error: 'Conta suspensa. Contate o suporte.' };
  if (tenant.status === 'CANCELLED') return { ok: false, error: 'Conta cancelada.' };
  const sub = tenant.subscription;
  if (sub) {
    if (!ACTIVE_SUB.includes(sub.status)) {
      return { ok: false, error: 'Assinatura inativa. Renove seu plano.' };
    }
    if (sub.endsAt && new Date(sub.endsAt) < new Date()) {
      return { ok: false, error: 'Assinatura expirada.' };
    }
    if (sub.status === 'TRIAL' && sub.trialEndsAt && new Date(sub.trialEndsAt) < new Date()) {
      return { ok: false, error: 'Período de trial expirado.' };
    }
  }
  return { ok: true, tenant };
}
