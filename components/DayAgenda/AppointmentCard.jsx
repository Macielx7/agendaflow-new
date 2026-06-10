'use client';

import { Loader2, MessageCircle } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/validations';
import styles from './DayAgenda.module.css';

export function ClientAvatar({ name }) {
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return <div className={styles.avatar}>{initials}</div>;
}

export default function AppointmentCard({
  appointment,
  onPresence,
  onNoShow,
  onEditTime,
  onFinish,
  onEdit,
  onDelete,
  onSendConfirmation,
  sendingConfirmation,
  onDragStart,
  onDragEnd,
  loading,
}) {
  const duration = appointment.effectiveDuration ?? appointment.duration ?? appointment.service?.duration ?? 60;
  const isInactive = ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status);
  const statusColor = STATUS_COLORS[appointment.status] || '#6366f1';
  const canSendConfirmation =
    !isInactive && Boolean(appointment.client?.phone) && Boolean(onSendConfirmation);

  return (
    <div
      className={`${styles.card} ${isInactive ? styles.inactiveCard : ''} ${loading ? styles.cardDragging : ''}`}
      style={{ '--status-color': statusColor }}
      draggable={!isInactive}
      onDragStart={(e) => {
        e.dataTransfer.setData('appointmentId', appointment.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(appointment.id);
      }}
      onDragEnd={() => onDragEnd?.()}
    >
      <div className={styles.cardHeader}>
        <ClientAvatar name={appointment.client?.name} />
        <div className={styles.cardInfo}>
          <div className={styles.clientName}>{appointment.client?.name}</div>
          <div className={styles.serviceName}>{appointment.service?.name}</div>
        </div>
        <span
          className={styles.statusBadge}
          style={{ background: `${statusColor}22`, color: statusColor }}
        >
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          Horário: <strong>{appointment.time}</strong>
          {appointment.endTime && ` – ${appointment.endTime}`}
        </div>
        <div className={styles.metaItem}>
          Duração: <strong>{duration} min</strong>
        </div>
        {appointment.client?.age != null && (
          <div className={styles.metaItem}>
            Idade: <strong>{appointment.client.age} anos</strong>
          </div>
        )}
      </div>

      {(appointment.notes || appointment.client?.notes) && (
        <div className={styles.notes}>
          {appointment.notes || appointment.client?.notes}
        </div>
      )}

      <div className={styles.actions}>
        {canSendConfirmation && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.btnWhatsapp}`}
            onClick={() => onSendConfirmation(appointment)}
            disabled={loading || sendingConfirmation}
            title="Enviar mensagem de confirmação no WhatsApp"
          >
            {sendingConfirmation ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <MessageCircle size={14} />
            )}
            {sendingConfirmation ? 'Enviando...' : 'Confirmar WhatsApp'}
          </button>
        )}
        {!isInactive && (
          <>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.btnPresence}`}
              onClick={() => onPresence(appointment)}
              disabled={loading || appointment.status === 'IN_PROGRESS'}
            >
              {appointment.status === 'CONFIRMED' ? 'Iniciar' : 'Presença'}
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.btnNoShow}`}
              onClick={() => onNoShow(appointment)}
              disabled={loading}
            >
              Faltante
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.btnTime}`}
              onClick={() => onEditTime(appointment)}
              disabled={loading}
            >
              Editar tempo
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.btnFinish}`}
              onClick={() => onFinish(appointment)}
              disabled={loading}
            >
              Finalizar
            </button>
          </>
        )}
        {onEdit && (
          <button type="button" className={styles.actionBtn} onClick={() => onEdit(appointment)} disabled={loading}>
            Editar
          </button>
        )}
        {appointment.status !== 'CANCELLED' && onDelete && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.btnDelete}`}
            onClick={() => onDelete(appointment)}
            disabled={loading}
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
