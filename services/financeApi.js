async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(res.ok ? 'Resposta inválida' : `Erro ${res.status}`);
  }
  if (!data?.success) throw new Error(data?.error || 'Erro na requisição');
  return data;
}

function qs(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '' && v !== 'all') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const financeApi = {
  dashboard: () => request('/api/finance/dashboard'),
  receivables: (params) => request(`/api/finance/receivables${qs(params)}`),
  createReceivable: (body) => request('/api/finance/receivables', { method: 'POST', body: JSON.stringify(body) }),
  updateReceivable: (id, body) => request(`/api/finance/receivables/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteReceivable: (id) => request(`/api/finance/receivables/${id}`, { method: 'DELETE' }),
  payables: (params) => request(`/api/finance/payables${qs(params)}`),
  createPayable: (body) => request('/api/finance/payables', { method: 'POST', body: JSON.stringify(body) }),
  updatePayable: (id, body) => request(`/api/finance/payables/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletePayable: (id) => request(`/api/finance/payables/${id}`, { method: 'DELETE' }),
  installments: (params) => request(`/api/finance/installments${qs(params)}`),
  updateInstallment: (id, body) => request(`/api/finance/installments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  budgets: (params) => request(`/api/finance/budgets${qs(params)}`),
  createBudget: (body) => request('/api/finance/budgets', { method: 'POST', body: JSON.stringify(body) }),
  updateBudget: (id, body) => request(`/api/finance/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  categories: (params) => request(`/api/finance/categories${qs(params)}`),
  createCategory: (body) => request('/api/finance/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id, body) => request(`/api/finance/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCategory: (id) => request(`/api/finance/categories/${id}`, { method: 'DELETE' }),
  commissions: (params) => request(`/api/finance/commissions${qs(params)}`),
  createCommissionRule: (body) => request('/api/finance/commissions', { method: 'POST', body: JSON.stringify(body) }),
  updateCommissionRule: (id, body) => request(`/api/finance/commissions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCommissionRule: (id) => request(`/api/finance/commissions/${id}`, { method: 'DELETE' }),
  cashflow: (params) => request(`/api/finance/cashflow${qs(params)}`),
  delinquency: (params) => request(`/api/finance/delinquency${qs(params)}`),
  report: (params) => request(`/api/finance/reports${qs(params)}`),
  sendReminders: () => request('/api/finance/reminders', { method: 'POST' }),
};
