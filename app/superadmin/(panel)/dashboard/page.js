'use client';

import { useEffect, useState } from 'react';
import MetricsCards from '@/components/superadmin/MetricsCards';
import RevenueCharts from '@/components/superadmin/RevenueCharts';
import { superApi } from '@/services/superadminApi';
import { formatDateShort } from '@/utils/format';
import { TENANT_STATUS } from '@/utils/superConstants';
import s from '@/styles/superadmin.module.css';

export default function SuperDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    superApi.dashboard().then(setData).catch(console.error);
  }, []);

  return (
    <>
      <h1 className={s.pageTitle}>Dashboard global</h1>
      <p className={s.pageSubtitle}>Métricas da plataforma em tempo real</p>
      <MetricsCards stats={data?.stats} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div className={s.card}>
          <div className={s.cardHeader}><h2 className={s.cardTitle}>Novos clientes — 7 dias</h2></div>
          <div className={s.cardBody}><RevenueCharts data={data?.chart || []} /></div>
        </div>
        <div className={s.card}>
          <div className={s.cardHeader}><h2 className={s.cardTitle}>Últimos cadastros</h2></div>
          <div className={s.cardBody} style={{ padding: 0 }}>
            {(data?.recentTenants || []).map((t) => (
              <div key={t.id} style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
                <div><strong>{t.companyName}</strong><span style={{ display: 'block', fontSize: '0.8rem', color: '#71717a' }}>{t.plan?.name}</span></div>
                <span style={{ fontSize: '0.8rem', color: '#52525b' }}>{formatDateShort(t.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
