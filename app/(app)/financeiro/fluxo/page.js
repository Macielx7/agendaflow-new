'use client';

import { useEffect, useState } from 'react';
import CashFlowView from '@/components/finance/CashFlowChart';
import { financeApi } from '@/services/financeApi';
import { formatCurrency, formatDateShort } from '@/utils/format';
import s from '@/styles/saas.module.css';

export default function FluxoPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeApi.cashflow({ days: 60 }).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Fluxo de Caixa</h1>
        <p className={s.pageSubtitle}>Entradas, saídas e saldo previsto</p>
      </div>
      <CashFlowView data={data} loading={loading} />
      {!loading && data?.movements?.length > 0 && (
        <div className={s.card} style={{ marginTop: 16 }}>
          <div className={s.cardHeader}><h2 className={s.cardTitle}>Movimentações recentes</h2></div>
          <div className={s.cardBody} style={{ padding: 0 }}>
            {data.movements.map((m) => (
              <div key={m.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{m.description}</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {m.type === 'IN' ? m.clientName : m.supplier} · {formatDateShort(m.date)}
                  </span>
                </div>
                <span style={{ color: m.type === 'IN' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                  {m.type === 'IN' ? '+' : '-'}{formatCurrency(m.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
