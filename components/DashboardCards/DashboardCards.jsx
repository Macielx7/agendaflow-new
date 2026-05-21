'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import s from '@/styles/saas.module.css';

const CARDS = [
  { key: 'today', label: 'Hoje', icon: Calendar, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { key: 'pending', label: 'Pendentes', icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { key: 'confirmed', label: 'Confirmados', icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  { key: 'revenue', label: 'Receita (30d)', icon: DollarSign, color: '#a855f7', bg: 'rgba(168,85,247,0.15)', format: 'currency' },
  { key: 'total', label: 'Total', icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
];

export default function DashboardCards({ stats }) {
  return (
    <div className={s.statsGrid}>
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        let value = stats?.[card.key] ?? 0;
        if (card.format === 'currency') value = formatCurrency(value);
        return (
          <motion.div key={card.key} className={s.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className={s.statIcon} style={{ background: card.bg, color: card.color }}><Icon size={20} /></div>
            <div className={s.statValue}>{value}</div>
            <div className={s.statLabel}>{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
