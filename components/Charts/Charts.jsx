'use client';

import { motion } from 'framer-motion';
import s from './Charts.module.css';

export default function Charts({ data = [] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className={s.chart}>
      <div className={s.bars}>
        {data.map((d, i) => (
          <div key={d.date} className={s.barGroup}>
            <motion.div
              className={s.bar}
              initial={{ height: 0 }}
              animate={{ height: `${(d.count / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              title={`${d.count} agendamentos`}
            />
            <span className={s.label}>{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
