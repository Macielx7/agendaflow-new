'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardCards from '@/components/DashboardCards/DashboardCards';
import AppointmentCard from '@/components/AppointmentCard/AppointmentCard';
import { fetchDashboard } from '@/services/appointmentService';
import styles from '@/styles/admin.module.css';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>
        Visão geral dos agendamentos e atividades da clínica
      </p>

      <DashboardCards stats={data?.stats} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Consultas de Hoje</h2>
            <Link href="/admin/agendamentos" className={styles.actionBtn}>
              Ver todos
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}>
              Carregando...
            </div>
          ) : data?.todayAppointments?.length ? (
            data.todayAppointments.map((apt, i) => (
              <AppointmentCard key={apt.id} appointment={apt} index={i} />
            ))
          ) : (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}>
              Nenhuma consulta agendada para hoje.
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Últimos Agendamentos</h2>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}>
              Carregando...
            </div>
          ) : data?.recent?.length ? (
            data.recent.map((apt, i) => (
              <AppointmentCard key={apt.id} appointment={apt} index={i} />
            ))
          ) : (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}>
              Nenhum agendamento recente.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
