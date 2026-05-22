'use client';

import { motion } from 'framer-motion';
import { Building2, DollarSign, Users, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import s from '@/styles/superadmin.module.css';

const CARDS = [
  { key: 'totalTenants', label: 'Clientes SaaS', icon: Building2, color: '#22d3ee' },
  { key: 'activeTenants', label: 'Contas ativas', icon: Users, color: '#4ade80' },
  { key: 'mrr', label: 'MRR estimado', icon: DollarSign, color: '#a78bfa', format: 'currency' },
  { key: 'revenueMonth', label: 'Receita do mês', icon: TrendingUp, color: '#fbbf24', format: 'currency' },
  { key: 'trialSubs', label: 'Em trial', icon: Sparkles, color: '#22d3ee' },
  { key: 'churn', label: 'Expiradas', icon: AlertTriangle, color: '#f87171' },
];

export default function MetricsCards({ stats }) {
  return (
    <div className={s.statsGrid}>
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        let val = stats?.[card.key] ?? 0;
        if (card.format === 'currency') val = formatCurrency(val);
        return (
          <motion.div key={card.key} className={s.statCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: card.color }}>
              <Icon size={20} />
            </div>
            <div className={s.statValue}>{val}</div>
            <div className={s.statLabel}>{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
