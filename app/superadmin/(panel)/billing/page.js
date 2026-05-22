'use client';

import { useEffect, useState } from 'react';
import { superApi } from '@/services/superadminApi';
import { formatCurrency, formatDateShort } from '@/utils/format';
import s from '@/styles/superadmin.module.css';

export default function BillingPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    superApi.billing().then(setData);
  }, []);

  return (
    <>
      <h1 className={s.pageTitle}>Financeiro</h1>
      <p className={s.pageSubtitle}>Histórico de faturamento da plataforma</p>
      {data && (
        <div className={s.statCard} style={{ marginBottom: 24, maxWidth: 280 }}>
          <div className={s.statValue}>{formatCurrency(data.totalPaid)}</div>
          <div className={s.statLabel}>Total recebido (lista)</div>
        </div>
      )}
      <div className={s.card}>
        <div style={{ overflowX: 'auto' }}>
          <table className={s.table}>
            <thead><tr><th>Empresa</th><th>Valor</th><th>Status</th><th>Descrição</th><th>Data</th></tr></thead>
            <tbody>
              {(data?.history || []).map((h) => (
                <tr key={h.id}>
                  <td>{h.tenant?.companyName}</td>
                  <td>{formatCurrency(h.amount)}</td>
                  <td><span className={`${s.badge} ${s[`badge${h.status}`] || ''}`}>{h.status}</span></td>
                  <td>{h.description || '—'}</td>
                  <td>{formatDateShort(h.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.history?.length && <p className={s.empty}>Sem registros</p>}
        </div>
      </div>
    </>
  );
}
