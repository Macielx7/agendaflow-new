'use client';

import { CashFlowChart as Chart } from './FinancialChart';
import { formatCurrency } from '@/utils/format';
import f from '@/styles/finance.module.css';

export default function CashFlowView({ data, loading }) {
  if (loading) return <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 240 }} />;

  const summary = data?.summary || {};

  return (
    <div className={f.financeWrap}>
      <div className={f.cashSummary}>
        <div className={f.cashBox}>
          <h4>Entradas</h4>
          <strong className={f.positive}>{formatCurrency(summary.totalIn)}</strong>
        </div>
        <div className={f.cashBox}>
          <h4>Saídas</h4>
          <strong className={f.negative}>{formatCurrency(summary.totalOut)}</strong>
        </div>
        <div className={f.cashBox}>
          <h4>Saldo atual</h4>
          <strong>{formatCurrency(summary.currentBalance)}</strong>
        </div>
        <div className={f.cashBox}>
          <h4>Saldo previsto</h4>
          <strong>{formatCurrency(summary.projectedBalance)}</strong>
        </div>
        <div className={f.cashBox}>
          <h4>A receber</h4>
          <strong className={f.positive}>{formatCurrency(summary.pendingIn)}</strong>
        </div>
        <div className={f.cashBox}>
          <h4>A pagar</h4>
          <strong className={f.negative}>{formatCurrency(summary.pendingOut)}</strong>
        </div>
      </div>
      <Chart data={data?.chart || []} title="Movimentações diárias" />
    </div>
  );
}
