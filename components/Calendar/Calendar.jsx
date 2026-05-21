'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, getDay, addDays, startOfWeek, endOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/validations';
import { formatDateShort } from '@/utils/format';
import styles from './Calendar.module.css';

export default function Calendar({
  view = 'month',
  currentDate,
  onDateChange,
  appointments = [],
  onSelectAppointment,
  onSelectDay,
}) {
  const aptByDate = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      const d = a.date?.slice?.(0, 10) || format(new Date(a.date), 'yyyy-MM-dd');
      if (!map[d]) map[d] = [];
      map[d].push(a);
    });
    return map;
  }, [appointments]);

  if (view === 'day') {
    const key = format(currentDate, 'yyyy-MM-dd');
    const dayApts = (aptByDate[key] || []).sort((a, b) => a.time.localeCompare(b.time));
    return (
      <div className={styles.dayView}>
        <h3 className={styles.dayTitle}>{format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</h3>
        {dayApts.length === 0 ? (
          <p className={styles.emptyDay}>Nenhum agendamento</p>
        ) : (
          dayApts.map((apt, i) => (
            <motion.button
              key={apt.id}
              type="button"
              className={styles.daySlot}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelectAppointment?.(apt)}
            >
              <span className={styles.time}>{apt.time}</span>
              <div>
                <strong>{apt.client?.name}</strong>
                <span>{apt.service?.name}</span>
              </div>
              <span className={`${styles.badge} ${styles[apt.status]}`}>{STATUS_LABELS[apt.status]}</span>
            </motion.button>
          ))
        )}
      </div>
    );
  }

  if (view === 'week') {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return (
      <div className={styles.weekGrid}>
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayApts = aptByDate[key] || [];
          return (
            <div key={key} className={styles.weekCol}>
              <button type="button" className={styles.weekHead} onClick={() => onSelectDay?.(day)}>
                <span>{format(day, 'EEE', { locale: ptBR })}</span>
                <strong>{format(day, 'd')}</strong>
              </button>
              <div className={styles.weekBody}>
                {dayApts.map((apt) => (
                  <button key={apt.id} type="button" className={styles.weekEvent} onClick={() => onSelectAppointment?.(apt)}>
                    <span>{apt.time}</span> {apt.client?.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const padding = getDay(monthStart);

  return (
    <div className={styles.month}>
      <div className={styles.monthHead}>
        <button type="button" onClick={() => onDateChange(subMonths(currentDate, 1))}><ChevronLeft size={20} /></button>
        <h3>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h3>
        <button type="button" onClick={() => onDateChange(addMonths(currentDate, 1))}><ChevronRight size={20} /></button>
      </div>
      <div className={styles.weekdays}>
        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className={styles.grid}>
        {Array.from({ length: padding }).map((_, i) => <div key={`p-${i}`} />)}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const count = (aptByDate[key] || []).length;
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={key}
              type="button"
              className={`${styles.cell} ${isToday ? styles.today : ''} ${count ? styles.hasEvents : ''}`}
              onClick={() => onSelectDay?.(day)}
            >
              <span>{format(day, 'd')}</span>
              {count > 0 && <span className={styles.dot}>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
