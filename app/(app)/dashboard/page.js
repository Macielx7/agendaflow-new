'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import DashboardCards from '@/components/DashboardCards/DashboardCards';
import Charts from '@/components/Charts/Charts';
import { api } from '@/services/api';
import { formatDateShort, formatCurrency } from '@/utils/format';
import { STATUS_LABELS } from '@/lib/validations';
import s from '@/styles/saas.module.css';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={s.statsGrid}>{[1,2,3,4,5].map((i) => <div key={i} className={`${s.statCard} ${s.skeleton}`} style={{ height: 120 }} />)}</div>;
  }

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Visão geral</h1>
          <p className={s.pageSubtitle}>Acompanhe agendamentos e desempenho da clínica</p>
        </div>
        <Link href="/agendamentos" className={s.btnPrimary}><Plus size={18} /> Novo agendamento</Link>
      </div>

      <DashboardCards stats={data?.stats} />

      <div className={s.grid2}>
        <div className={s.card}>
          <div className={s.cardHeader}><h2 className={s.cardTitle}>Agendamentos — 7 dias</h2></div>
          <div className={s.cardBody}><Charts data={data?.chart || []} /></div>
        </div>
        <div className={s.card}>
          <div className={s.cardHeader}><h2 className={s.cardTitle}>Próximos clientes</h2></div>
          <div className={s.cardBody} style={{ padding: 0 }}>
            {(data?.upcoming || []).length === 0 ? (
              <p className={s.empty}>Nenhum agendamento próximo</p>
            ) : (
              data.upcoming.map((apt) => (
                <div key={apt.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{apt.client?.name}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.service?.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem' }}>{formatDateShort(apt.date)} · {apt.time}</span>
                    <span className={`${s.badge} ${s[`badge${apt.status}`]}`} style={{ display: 'block', marginTop: 4 }}>{STATUS_LABELS[apt.status]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={s.card} style={{ marginTop: 20 }}>
        <div className={s.cardHeader}><h2 className={s.cardTitle}>Consultas de hoje</h2></div>
        <div className={s.cardBody} style={{ padding: 0 }}>
          {(data?.todayAppointments || []).length === 0 ? (
            <p className={s.empty}>Sem consultas hoje</p>
          ) : (
            data.todayAppointments.map((apt) => (
              <div key={apt.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-hover)', minWidth: 48 }}>{apt.time}</span>
                <div style={{ flex: 1 }}>
                  <strong>{apt.client?.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.service?.name}</span>
                </div>
                <span>{formatCurrency(apt.price || apt.service?.price)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
