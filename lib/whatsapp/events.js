const channels = new Map();

export function publishWhatsAppEvent(tenantId, event) {
  const channel = channels.get(tenantId);
  if (!channel) return;
  const payload = `data: ${JSON.stringify({ ...event, ts: Date.now() })}\n\n`;
  channel.forEach((send) => {
    try {
      send(payload);
    } catch {
      /* ignore */
    }
  });
}

export function subscribeWhatsAppEvents(tenantId, send) {
  if (!channels.has(tenantId)) channels.set(tenantId, new Set());
  channels.get(tenantId).add(send);
  return () => {
    const set = channels.get(tenantId);
    if (!set) return;
    set.delete(send);
    if (set.size === 0) channels.delete(tenantId);
  };
}
