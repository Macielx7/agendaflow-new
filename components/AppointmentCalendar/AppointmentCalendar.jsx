'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
  addDays,
  getDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './AppointmentCalendar.module.css';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AppointmentCalendar({ selectedDate, onSelectDate, maxDays = 60 }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxDays);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start, end });
    const startPadding = getDay(start);
    const padding = Array.from({ length: startPadding }, (_, i) => null);
    return [...padding, ...monthDays];
  }, [currentMonth]);

  const isDisabled = (day) => {
    if (!day) return true;
    if (isBefore(day, today)) return true;
    if (isBefore(maxDate, day)) return true;
    return false;
  };

  const handleDayClick = (day) => {
    if (!day || isDisabled(day)) return;
    onSelectDate(format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d} className={styles.weekday}>
            {d}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className={styles.empty} />;
          const selected = selectedDate && isSameDay(day, new Date(selectedDate + 'T12:00:00'));
          const disabled = isDisabled(day);
          const isToday = isSameDay(day, today);

          return (
            <motion.button
              key={day.toISOString()}
              type="button"
              className={`${styles.day} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''} ${isToday ? styles.today : ''}`}
              onClick={() => handleDayClick(day)}
              disabled={disabled}
              whileTap={disabled ? {} : { scale: 0.92 }}
            >
              {format(day, 'd')}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
