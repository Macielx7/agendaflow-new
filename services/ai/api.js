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

export const aiApi = {
  settings: () => request('/api/ai/settings'),
  updateSettings: (body) =>
    request('/api/ai/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  knowledge: () => request('/api/ai/knowledge'),
  createKnowledge: (body) =>
    request('/api/ai/knowledge', { method: 'POST', body: JSON.stringify(body) }),
  updateKnowledge: (id, body) =>
    request(`/api/ai/knowledge/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteKnowledge: (id) =>
    request(`/api/ai/knowledge/${id}`, { method: 'DELETE' }),
  metrics: (days = 30) => request(`/api/ai/metrics?days=${days}`),
  sessions: () => request('/api/ai/sessions'),
  updateSession: (body) =>
    request('/api/ai/sessions', { method: 'PATCH', body: JSON.stringify(body) }),
};
