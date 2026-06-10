'use client';

import { useEffect, useState } from 'react';
import { aiApi } from '@/services/ai/api';
import s from '@/styles/ai.module.css';

export default function AIMetricsCards() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiApi
      .metrics(30)
      .then((d) => setMetrics(d.metrics))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={s.metricsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={s.metric}>
            <div className={s.metricValue}>—</div>
            <div className={s.metricLabel}>Carregando</div>
          </div>
        ))}
      </div>
    );
  }

  const m = metrics || {};

  const cards = [
    { value: m.received ?? 0, label: 'Mensagens recebidas' },
    { value: m.responded ?? 0, label: 'Mensagens respondidas' },
    { value: `${m.accuracyRate ?? 0}%`, label: 'Taxa de acerto' },
    { value: m.transferred ?? 0, label: 'Transferências humano' },
    { value: m.knowledgeCount ?? 0, label: 'Base conhecimento' },
    { value: m.faqCount ?? 0, label: 'Entradas FAQ' },
  ];

  return (
    <>
      <div className={s.metricsGrid}>
        {cards.map((c) => (
          <div key={c.label} className={s.metric}>
            <div className={s.metricValue}>{c.value}</div>
            <div className={s.metricLabel}>{c.label}</div>
          </div>
        ))}
      </div>
      {m.intents?.length > 0 && (
        <div className={s.card} style={{ marginTop: 16 }}>
          <div className={s.cardHeader}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Intenções detectadas (30 dias)</h3>
          </div>
          <div className={s.cardBody}>
            <div className={s.intentList}>
              {m.intents.map((item) => (
                <div key={item.intent} className={s.intentRow}>
                  <span>{item.intent}</span>
                  <span className={s.intentCount}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
