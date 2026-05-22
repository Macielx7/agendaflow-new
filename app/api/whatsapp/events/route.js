export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { requireTenantId } from '@/lib/tenant';
import { subscribeWhatsAppEvents } from '@/lib/whatsapp/events';

export async function GET() {
  const { tenantId, error } = await requireTenantId();
  if (error) return error;

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload) => {
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          /* closed */
        }
      };

      send(`data: ${JSON.stringify({ type: 'connected', ts: Date.now() })}\n\n`);
      unsubscribe = subscribeWhatsAppEvents(tenantId, send);

      heartbeat = setInterval(() => {
        send(`data: ${JSON.stringify({ type: 'ping', ts: Date.now() })}\n\n`);
      }, 25000);
    },
    cancel() {
      unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
