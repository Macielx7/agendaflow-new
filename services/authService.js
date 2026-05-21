export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao fazer login');
  return data.user;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function getCurrentUser() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  if (!data.success) return null;
  return data.user;
}

export async function updateProfile(payload) {
  const res = await fetch('/api/admin/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao atualizar perfil');
  return data.user;
}

export async function fetchSettings() {
  const res = await fetch('/api/admin/settings');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao carregar configurações');
  return data.settings;
}

export async function updateSettings(settings) {
  const res = await fetch('/api/admin/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao salvar');
  return data.settings;
}
