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

export const whatsappApi = {
  instance: () => request('/api/whatsapp/instance'),
  connect: () => request('/api/whatsapp/instance', { method: 'POST' }),
  qrcode: () => request('/api/whatsapp/qrcode'),
  status: () => request('/api/whatsapp/status'),
  disconnect: () => request('/api/whatsapp/disconnect', { method: 'POST' }),
  metrics: () => request('/api/whatsapp/metrics'),
  templates: () => request('/api/whatsapp/templates'),
  saveTemplates: (templates) =>
    request('/api/whatsapp/templates', { method: 'PUT', body: JSON.stringify({ templates }) }),
  settings: () => request('/api/whatsapp/settings'),
  updateSettings: (body) =>
    request('/api/whatsapp/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  logs: (limit = 50) => request(`/api/whatsapp/logs?limit=${limit}`),
  messages: (params = {}) => request(`/api/whatsapp/messages?${new URLSearchParams(params)}`),
  send: (body) => request('/api/whatsapp/send', { method: 'POST', body: JSON.stringify(body) }),
  processReminders: () => request('/api/whatsapp/reminders/process', { method: 'POST' }),
};
