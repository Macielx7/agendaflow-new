'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STATUS_LABELS } from '@/lib/validations';
import styles from '@/styles/admin.module.css';

function StatusBadge({ status }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status${status}`]}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatDate(date) {
  const d = new Date(date);
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export default function AdminTable({ appointments, loading }) {
  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-500)' }}>
        Carregando agendamentos...
      </div>
    );
  }

  if (!appointments?.length) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-500)' }}>
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Procedimento</th>
              <th>Data</th>
              <th>Horário</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id}>
                <td>
                  <strong>{apt.patientName}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    {apt.patientPhone}
                  </div>
                </td>
                <td>{apt.procedure?.name}</td>
                <td>{formatDate(apt.date)}</td>
                <td>{apt.time}</td>
                <td>
                  <StatusBadge status={apt.status} />
                </td>
                <td>
                  <Link href={`/admin/agendamentos/${apt.id}`} className={styles.actionBtn}>
                    Ver detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cardList}>
        {appointments.map((apt) => (
          <div key={apt.id} className={styles.appointmentCard}>
            <div className={styles.appointmentCardHeader}>
              <div>
                <div className={styles.appointmentCardName}>{apt.patientName}</div>
                <div className={styles.appointmentCardMeta}>
                  {apt.procedure?.name} · {formatDate(apt.date)} às {apt.time}
                </div>
              </div>
              <StatusBadge status={apt.status} />
            </div>
            <Link href={`/admin/agendamentos/${apt.id}`} className={styles.actionBtn}>
              Ver detalhes
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
