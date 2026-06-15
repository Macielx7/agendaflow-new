'use client';

import { motion } from 'framer-motion';
import f from '@/styles/finance.module.css';

export default function FinancialCard({ label, value, sub, variant, loading }) {
  if (loading) {
    return <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 90 }} />;
  }
  return (
    <motion.div
      className={f.finCard}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={f.finCardLabel}>{label}</div>
      <div className={`${f.finCardValue} ${variant ? f[variant] : ''}`}>{value}</div>
      {sub && <div className={f.finCardSub}>{sub}</div>}
    </motion.div>
  );
}
