'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import styles from '@/styles/admin.module.css';

const cards = [
  { key: 'today', label: 'Consultas Hoje', icon: Calendar, color: '#4a9fd4', bg: '#e8f4fc' },
  { key: 'week', label: 'Esta Semana', icon: Clock, color: '#c9a962', bg: '#faf5e8' },
  { key: 'pending', label: 'Pendentes', icon: AlertCircle, color: '#f59e0b', bg: '#fef3c7' },
  { key: 'confirmed', label: 'Confirmados', icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
];

export default function DashboardCards({ stats }) {
  return (
    <div className={styles.statsGrid}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;
        return (
          <motion.div
            key={card.key}
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div
              className={styles.statIcon}
              style={{ background: card.bg, color: card.color }}
            >
              <Icon size={22} />
            </div>
            <div className={styles.statValue}>{value}</div>
            <div className={styles.statLabel}>{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
