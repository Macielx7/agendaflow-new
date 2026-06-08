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
    throw new Error(res.ok ? 'Resposta inválida do servidor' : `Erro ${res.status}: ${text || 'sem resposta'}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || `Erro ${res.status}: ${text || 'Erro na requisição'}`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  forgotPassword: (email) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) =>
    request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),

  dashboard: () => request('/api/dashboard'),
  appointments: (params = {}) => request(`/api/appointments?${new URLSearchParams(params)}`),
  appointment: (id) => request(`/api/appointments/${id}`),
  createAppointment: (body) =>
    request('/api/appointments', { method: 'POST', body: JSON.stringify(body) }),
  updateAppointment: (id, body) =>
    request(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  cancelAppointment: (id) => request(`/api/appointments/${id}`, { method: 'DELETE' }),
  dayAgenda: (date, params = {}) =>
    request(`/api/appointments/day?date=${date}&${new URLSearchParams(params)}`),
  appointmentAction: (id, body) =>
    request(`/api/appointments/${id}/actions`, { method: 'POST', body: JSON.stringify(body) }),

  clients: (params = {}) => {
    const q = new URLSearchParams();
    if (typeof params === 'string') {
      if (params) q.set('search', params);
    } else {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '' && v !== 'all') q.set(k, String(v));
      });
    }
    const qs = q.toString();
    return request(`/api/clients${qs ? `?${qs}` : ''}`);
  },
  client: (id) => request(`/api/clients/${id}`),
  createClient: (body) => request('/api/clients', { method: 'POST', body: JSON.stringify(body) }),
  updateClient: (id, body) =>
    request(`/api/clients/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteClient: (id) => request(`/api/clients/${id}`, { method: 'DELETE' }),

  services: () => request('/api/services'),
  createService: (body) => request('/api/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id, body) =>
    request(`/api/services/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteService: (id) => request(`/api/services/${id}`, { method: 'DELETE' }),

  schedules: () => request('/api/schedules'),
  updateSchedules: (schedules) =>
    request('/api/schedules', { method: 'PUT', body: JSON.stringify({ schedules }) }),

  holidays: () => request('/api/holidays'),
  createHoliday: (body) => request('/api/holidays', { method: 'POST', body: JSON.stringify(body) }),
  deleteHoliday: (id) => request(`/api/holidays/${id}`, { method: 'DELETE' }),

  slots: (date, serviceId) =>
    request(`/api/slots?date=${date}${serviceId ? `&serviceId=${serviceId}` : ''}`),

  settings: () => request('/api/settings'),
  updateSettings: (settings) =>
    request('/api/settings', { method: 'PATCH', body: JSON.stringify({ settings }) }),

  profile: () => request('/api/profile'),
  updateProfile: (body) =>
    request('/api/profile', { method: 'PATCH', body: JSON.stringify(body) }),
};
