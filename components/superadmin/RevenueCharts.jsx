'use client';

import { motion } from 'framer-motion';
import styles from '@/components/Charts/Charts.module.css';

export default function RevenueCharts({ data = [] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className={styles.chart}>
      <div className={styles.bars}>
        {data.map((d, i) => (
          <div key={d.date} className={styles.barGroup}>
            <motion.div
              className={styles.bar}
              style={{ background: 'linear-gradient(180deg, #22d3ee, #06b6d4)' }}
              initial={{ height: 0 }}
              animate={{ height: `${(d.count / max) * 100}%` }}
              transition={{ delay: i * 0.05 }}
            />
            <span className={styles.label}>{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
