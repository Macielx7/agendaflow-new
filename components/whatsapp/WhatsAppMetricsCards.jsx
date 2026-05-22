'use client';

import { motion } from 'framer-motion';
import { MessageCircle, CheckCircle, XCircle, Zap } from 'lucide-react';
import s from '@/styles/whatsapp.module.css';

export default function WhatsAppMetricsCards({ metrics, loading }) {
  if (loading) {
    return (
      <div className={s.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={s.skeleton} />
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Enviadas', value: metrics?.messagesSent ?? 0, icon: CheckCircle, sub: 'Total com sucesso' },
    { label: 'Falhas', value: metrics?.messagesFailed ?? 0, icon: XCircle, sub: 'Não entregues' },
    { label: 'Total', value: metrics?.messagesTotal ?? 0, icon: MessageCircle, sub: 'Histórico' },
    { label: 'Automações', value: metrics?.automationsActive ?? 0, icon: Zap, sub: 'Módulos ativos' },
  ];

  return (
    <div className={s.grid}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            className={s.metricCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className={s.metricLabel}>{item.label}</span>
              <Icon size={18} style={{ color: '#4ade80', opacity: 0.7 }} />
            </div>
            <div className={s.metricValue}>{item.value}</div>
            <div className={s.metricSub}>{item.sub}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
