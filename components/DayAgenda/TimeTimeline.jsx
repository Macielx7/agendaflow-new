'use client';

import { STATUS_COLORS, STATUS_LABELS } from '@/lib/validations';
import styles from './DayAgenda.module.css';

export default function TimeTimeline({
  schedule,
  appointments,
  freeSlots,
  onDropSlot,
  dragOverTime,
  onDragOver,
  onDragLeave,
}) {
  if (!schedule) {
    return (
      <div className={styles.timelinePanel}>
        <p className={styles.emptyState}>Sem horário configurado</p>
      </div>
    );
  }

  const aptMap = {};
  appointments.forEach((a) => {
    if (!['CANCELLED', 'NO_SHOW'].includes(a.status)) {
      aptMap[a.time] = a;
    }
  });

  const freeSet = new Set(freeSlots || []);
  const times = [];
  const startH = parseInt(schedule.startTime.split(':')[0], 10);
  const startM = parseInt(schedule.startTime.split(':')[1], 10);
  const endH = parseInt(schedule.endTime.split(':')[0], 10);
  const endM = parseInt(schedule.endTime.split(':')[1], 10);
  const step = schedule.slotDuration || 30;

  let cursor = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (cursor < end) {
    const h = Math.floor(cursor / 60);
    const m = cursor % 60;
    times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    cursor += step;
  }

  return (
    <div className={styles.timelinePanel}>
      <div className={styles.timelineTitle}>Linha do tempo</div>
      <div className={styles.timeline}>
        {times.map((time) => {
          const apt = aptMap[time];
          const isFree = freeSet.has(time);
          const isDragOver = dragOverTime === time;

          return (
            <div key={time} className={styles.timelineSlot}>
              <span className={styles.timelineTime}>{time}</span>
              <div className={styles.timelineLine}>
                <div className={`${styles.timelineDot} ${apt ? styles.timelineDotActive : ''}`} />
              </div>
              <div className={styles.timelineContent}>
                {apt ? (
                  <div
                    className={styles.timelineAppt}
                    style={{
                      background: `${STATUS_COLORS[apt.status]}22`,
                      color: STATUS_COLORS[apt.status],
                    }}
                  >
                    {apt.client?.name?.split(' ')[0]} · {STATUS_LABELS[apt.status]}
                  </div>
                ) : isFree ? (
                  <div
                    className={`${styles.timelineFree} ${isDragOver ? styles.timelineFreeDragOver : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      onDragOver?.(time);
                    }}
                    onDragLeave={() => onDragLeave?.()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData('appointmentId');
                      if (id) onDropSlot?.(id, time);
                    }}
                  >
                    Horário livre
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
