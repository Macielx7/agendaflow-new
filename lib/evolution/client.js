const DEFAULT_TIMEOUT = 30000;

export function getEvolutionConfig() {
  const baseUrl = (process.env.EVOLUTION_API_URL || '').replace(/\/$/, '');
  const apiKey = process.env.EVOLUTION_API_KEY || '';
  const webhookBase = (process.env.EVOLUTION_WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  return { baseUrl, apiKey, webhookBase, configured: Boolean(baseUrl && apiKey) };
}

export async function evolutionFetch(path, options = {}) {
  const { baseUrl, apiKey, configured } = getEvolutionConfig();
  if (!configured) {
    throw new Error('Evolution API não configurada. Defina EVOLUTION_API_URL e EVOLUTION_API_KEY no .env');
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const msg = data?.message || data?.error || data?.response?.message || `Evolution API erro ${res.status}`;
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}
