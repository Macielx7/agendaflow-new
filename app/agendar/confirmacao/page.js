'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Calendar, Home } from 'lucide-react';
import { formatDateBR } from '@/utils/booking';
import { getWhatsAppLink } from '@/utils/helpers';
import styles from '@/styles/booking.module.css';

export default function ConfirmacaoPage() {
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('lastAppointment');
    if (stored) {
      try {
        setAppointment(JSON.parse(stored));
      } catch {
        setAppointment(null);
      }
    }
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ maxWidth: 560, paddingTop: 80 }}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.confirmIcon}>
            <Check size={40} />
          </div>
          <h1 className={styles.confirmTitle}>Agendamento recebido!</h1>
          <p className={styles.confirmText}>
            Sua solicitação foi registrada com sucesso. Nossa equipe entrará em contato
            em breve para confirmar sua consulta com todo o cuidado que você merece.
          </p>

          {appointment && (
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Procedimento</span>
                <span className={styles.summaryValue}>
                  {appointment.procedure?.name}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Data</span>
                <span className={styles.summaryValue}>
                  {formatDateBR(appointment.date?.slice?.(0, 10) || appointment.date)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Horário</span>
                <span className={styles.summaryValue}>{appointment.time}</span>
              </div>
            </div>
          )}

          <div className={styles.actions} style={{ flexDirection: 'column' }}>
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%' }}>
              Falar no WhatsApp
            </a>
            <Link href="/agendar" className={styles.btnBack} style={{ width: '100%', justifyContent: 'center' }}>
              <Calendar size={18} />
              Novo agendamento
            </Link>
            <Link href="/" className={styles.btnBack} style={{ width: '100%', justifyContent: 'center' }}>
              <Home size={18} />
              Voltar ao site
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
