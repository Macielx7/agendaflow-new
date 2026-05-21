'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  fetchAdminAppointment,
  updateAppointment,
  cancelAppointment,
} from '@/services/appointmentService';
import { useToast } from '@/context/ToastContext';
import { STATUS_LABELS } from '@/lib/validations';
import { formatDateBR, formatPhoneDisplay } from '@/utils/booking';
import styles from '@/styles/admin.module.css';

export default function AgendamentoDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAdminAppointment(id)
      .then(setAppointment)
      .catch(() => {
        toast.error('Agendamento não encontrado');
        router.push('/admin/agendamentos');
      })
      .finally(() => setLoading(false));
  }, [id, router, toast]);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      const updated = await updateAppointment(id, { status });
      setAppointment(updated);
      toast.success(`Status alterado para ${STATUS_LABELS[status]}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    setUpdating(true);
    try {
      const updated = await cancelAppointment(id);
      setAppointment(updated);
      toast.success('Agendamento cancelado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--blue)' }} />
      </div>
    );
  }

  if (!appointment) return null;

  const dateStr = appointment.date?.slice?.(0, 10) || appointment.date;

  return (
    <>
      <Link
        href="/admin/agendamentos"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
          color: 'var(--gray-500)',
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={18} />
        Voltar aos agendamentos
      </Link>

      <h1 className={styles.pageTitle}>{appointment.patientName}</h1>
      <p className={styles.pageSubtitle}>
        <span className={`${styles.statusBadge} ${styles[`status${appointment.status}`]}`}>
          {STATUS_LABELS[appointment.status]}
        </span>
      </p>

      <div className={styles.detailGrid}>
        <div className={styles.detailSection}>
          <h3>Dados do Paciente</h3>
          <div className={styles.detailRow}>
            <span>Nome</span>
            <strong>{appointment.patientName}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>WhatsApp</span>
            <strong>{formatPhoneDisplay(appointment.patientPhone)}</strong>
          </div>
          {appointment.patientEmail && (
            <div className={styles.detailRow}>
              <span>E-mail</span>
              <strong>{appointment.patientEmail}</strong>
            </div>
          )}
          {appointment.notes && (
            <div className={styles.detailRow}>
              <span>Observações</span>
              <strong style={{ maxWidth: '60%', textAlign: 'right' }}>{appointment.notes}</strong>
            </div>
          )}
        </div>

        <div className={styles.detailSection}>
          <h3>Consulta</h3>
          <div className={styles.detailRow}>
            <span>Procedimento</span>
            <strong>{appointment.procedure?.name}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Data</span>
            <strong>{formatDateBR(dateStr)}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Horário</span>
            <strong>{appointment.time}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Duração</span>
            <strong>~{appointment.procedure?.duration || 60} min</strong>
          </div>
        </div>
      </div>

      {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
        <div className={styles.detailActions}>
          {appointment.status === 'PENDING' && (
            <button
              type="button"
              className={styles.btnConfirm}
              onClick={() => handleStatus('CONFIRMED')}
              disabled={updating}
            >
              Confirmar Consulta
            </button>
          )}
          {appointment.status === 'CONFIRMED' && (
            <button
              type="button"
              className={styles.btnComplete}
              onClick={() => handleStatus('COMPLETED')}
              disabled={updating}
            >
              Marcar como Finalizado
            </button>
          )}
          <button
            type="button"
            className={styles.btnCancel}
            onClick={handleCancel}
            disabled={updating}
          >
            Cancelar Agendamento
          </button>
        </div>
      )}
    </>
  );
}
