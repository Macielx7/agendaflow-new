import { getSession } from './auth';
import { unauthorizedResponse } from './api';

export async function requireTenantId() {
  const session = await getSession();
  if (!session?.tenantId) return { error: unauthorizedResponse() };
  return { tenantId: session.tenantId, session };
}

export function withTenant(tenantId, where = {}) {
  return { ...where, tenantId };
}

export function withTenantData(tenantId, data = {}) {
  return { ...data, tenantId };
}
