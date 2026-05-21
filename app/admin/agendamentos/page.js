'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import AdminTable from '@/components/AdminTable/AdminTable';
import { fetchAdminAppointments } from '@/services/appointmentService';
import { STATUS_LABELS } from '@/lib/validations';
import styles from '@/styles/admin.module.css';

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    if (date) params.date = date;

    fetchAdminAppointments(params)
      .then((data) => setAppointments(data.appointments))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, search, date]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  return (
    <>
      <h1 className={styles.pageTitle}>Agendamentos</h1>
      <p className={styles.pageSubtitle}>
        Gerencie consultas, confirme pacientes e acompanhe o fluxo da clínica
      </p>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.filters}>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)',
                }}
              />
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Buscar paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 42 }}
              />
            </div>
            <select
              className={styles.filterSelect}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="date"
              className={styles.filterInput}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <AdminTable appointments={appointments} loading={loading} />
      </div>
    </>
  );
}
