'use client';

import { useEffect, useState, useCallback } from 'react';
import { whatsappApi } from '@/services/whatsapp/api';

export function useWhatsAppStatus() {
  const [instance, setInstance] = useState(null);
  const [settings, setSettings] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evolutionConfigured, setEvolutionConfigured] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [inst, met] = await Promise.all([
        whatsappApi.instance(),
        whatsappApi.metrics().catch(() => null),
      ]);
      setInstance(inst.instance);
      setSettings(inst.settings);
      setEvolutionConfigured(inst.evolutionConfigured !== false);
      if (met) setMetrics(met.metrics);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const es = new EventSource('/api/whatsapp/events');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'status' || data.type === 'qrcode') {
          refresh();
        }
        if (data.type === 'qrcode' && data.qrCode) {
          setInstance((prev) => (prev ? { ...prev, qrCode: data.qrCode, status: data.status || 'CONNECTING' } : prev));
        }
        if (data.type === 'status') {
          setInstance((prev) =>
            prev
              ? {
                  ...prev,
                  status: data.status,
                  phoneNumber: data.phoneNumber ?? prev.phoneNumber,
                  profileName: data.profileName ?? prev.profileName,
                }
              : prev
          );
        }
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, [refresh]);

  return {
    instance,
    settings,
    metrics,
    loading,
    evolutionConfigured,
    refresh,
  };
}
