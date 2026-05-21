'use client';

import { motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import styles from './BookingTimeSlots.module.css';

export default function BookingTimeSlots({
  slots = [],
  allSlots = [],
  bookedTimes = [],
  selectedTime,
  onSelectTime,
  loading,
  message,
}) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={32} className={styles.spinner} />
        <span>Carregando horários disponíveis...</span>
      </div>
    );
  }

  if (message && slots.length === 0) {
    return (
      <div className={styles.empty}>
        <Clock size={40} />
        <p>{message}</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={styles.empty}>
        <Clock size={40} />
        <p>Nenhum horário disponível nesta data. Escolha outro dia.</p>
      </div>
    );
  }

  const unavailable = allSlots.filter((s) => !slots.includes(s) || bookedTimes.includes(s));

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>Selecione o horário de sua preferência</p>
      <div className={styles.grid}>
        {allSlots.length > 0
          ? allSlots.map((slot) => {
              const isBooked = bookedTimes.includes(slot) || !slots.includes(slot);
              const isSelected = selectedTime === slot;

              return (
                <motion.button
                  key={slot}
                  type="button"
                  className={`${styles.slot} ${isSelected ? styles.selected : ''} ${isBooked ? styles.unavailable : ''}`}
                  onClick={() => !isBooked && onSelectTime(slot)}
                  disabled={isBooked}
                  whileTap={isBooked ? {} : { scale: 0.95 }}
                >
                  {slot}
                </motion.button>
              );
            })
          : slots.map((slot) => (
              <motion.button
                key={slot}
                type="button"
                className={`${styles.slot} ${selectedTime === slot ? styles.selected : ''}`}
                onClick={() => onSelectTime(slot)}
                whileTap={{ scale: 0.95 }}
              >
                {slot}
              </motion.button>
            ))}
      </div>
      {unavailable.length > 0 && (
        <p className={styles.legend}>
          Horários em cinza já estão reservados ou indisponíveis
        </p>
      )}
    </div>
  );
}
