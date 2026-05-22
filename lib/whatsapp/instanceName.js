export function getInstanceName(tenantId) {
  const safe = String(tenantId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
  return `tenant_${safe}`;
}
