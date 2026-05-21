export async function fetchProcedures() {
  const res = await fetch('/api/procedures');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao carregar procedimentos');
  return data.procedures;
}

export async function fetchSlots(date) {
  const res = await fetch(`/api/slots?date=${date}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao carregar horários');
  return data;
}

export async function createAppointment(payload) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao criar agendamento');
  return data.appointment;
}

export async function fetchAdminAppointments(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/admin/appointments?${query}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao carregar agendamentos');
  return data;
}

export async function fetchAdminAppointment(id) {
  const res = await fetch(`/api/admin/appointments/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Agendamento não encontrado');
  return data.appointment;
}

export async function updateAppointment(id, payload) {
  const res = await fetch(`/api/admin/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao atualizar');
  return data.appointment;
}

export async function cancelAppointment(id) {
  const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao cancelar');
  return data.appointment;
}

export async function fetchDashboard() {
  const res = await fetch('/api/admin/dashboard');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao carregar dashboard');
  return data;
}
