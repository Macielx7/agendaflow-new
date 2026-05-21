'use client';

import { STATUS_LABELS } from '@/lib/validations';
import { formatDateShort, formatCurrency } from '@/utils/format';
import s from '@/styles/saas.module.css';

function Badge({ status }) {
  return <span className={`${s.badge} ${s[`badge${status}`]}`}>{STATUS_LABELS[status]}</span>;
}

export default function AppointmentTable({ appointments, onEdit, onCancel, loading }) {
  if (loading) return <div className={s.empty}>Carregando...</div>;
  if (!appointments?.length) return <div className={s.empty}>Nenhum agendamento</div>;

  return (
    <>
      <div className={s.tableWrap} style={{ overflowX: 'auto' }}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Cliente</th><th>Serviço</th><th>Data</th><th>Hora</th><th>Valor</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id}>
                <td><strong>{apt.client?.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.client?.phone}</div></td>
                <td>{apt.service?.name}</td>
                <td>{formatDateShort(apt.date)}</td>
                <td>{apt.time}</td>
                <td>{formatCurrency(apt.price || apt.service?.price)}</td>
                <td><Badge status={apt.status} /></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className={s.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => onEdit(apt)}>Editar</button>
                    {apt.status !== 'CANCELLED' && (
                      <button type="button" className={s.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f87171' }} onClick={() => onCancel(apt)}>Cancelar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.cardList}>
        {appointments.map((apt) => (
          <div key={apt.id} className={s.mobileCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{apt.client?.name}</strong>
              <Badge status={apt.status} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{apt.service?.name} · {formatDateShort(apt.date)} {apt.time}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" className={s.btnSecondary} style={{ flex: 1 }} onClick={() => onEdit(apt)}>Editar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
