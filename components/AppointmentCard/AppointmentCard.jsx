'use client';

import { motion } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/validations';
import styles from './AppointmentCard.module.css';

export default function AppointmentCard({ appointment, index = 0 }) {
  if (!appointment) return null;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className={styles.time}>
        <Clock size={14} />
        {appointment.time}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>
          <User size={14} />
          {appointment.patientName}
        </div>
        <div className={styles.procedure}>{appointment.procedure?.name}</div>
      </div>
      <span className={`${styles.status} ${styles[appointment.status]}`}>
        {STATUS_LABELS[appointment.status]}
      </span>
    </motion.div>
  );
}
