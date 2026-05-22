async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro');
  return data;
}

export const superApi = {
  login: (email, password) =>
    request('/api/superadmin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/superadmin/auth/logout', { method: 'POST' }),
  me: () => request('/api/superadmin/auth/me'),
  dashboard: () => request('/api/superadmin/dashboard'),
  tenants: (params = {}) => request(`/api/superadmin/tenants?${new URLSearchParams(params)}`),
  tenant: (id) => request(`/api/superadmin/tenants/${id}`),
  createTenant: (body) => request('/api/superadmin/tenants', { method: 'POST', body: JSON.stringify(body) }),
  updateTenant: (id, body) =>
    request(`/api/superadmin/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTenant: (id) => request(`/api/superadmin/tenants/${id}`, { method: 'DELETE' }),
  impersonate: (id) => request(`/api/superadmin/tenants/${id}/impersonate`, { method: 'POST' }),
  tenantFeatures: (id) => request(`/api/superadmin/tenants/${id}/features`),
  updateFeatures: (id, features) =>
    request(`/api/superadmin/tenants/${id}/features`, { method: 'PUT', body: JSON.stringify({ features }) }),
  plans: () => request('/api/superadmin/plans'),
  createPlan: (body) => request('/api/superadmin/plans', { method: 'POST', body: JSON.stringify(body) }),
  updatePlan: (id, body) =>
    request(`/api/superadmin/plans/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  subscriptions: (params = {}) =>
    request(`/api/superadmin/subscriptions?${new URLSearchParams(params)}`),
  updateSubscription: (id, body) =>
    request(`/api/superadmin/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  billing: () => request('/api/superadmin/billing'),
  logs: (params = {}) => request(`/api/superadmin/logs?${new URLSearchParams(params)}`),
};
