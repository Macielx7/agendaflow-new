'use client';

import { useEffect, useState } from 'react';
import FinancialDashboard from '@/components/finance/FinancialDashboard';
import { financeApi } from '@/services/financeApi';
import s from '@/styles/saas.module.css';

export default function FinanceiroDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeApi.dashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Dashboard Financeiro</h1>
        <p className={s.pageSubtitle}>Indicadores, receitas e fluxo de caixa da clínica</p>
      </div>
      <FinancialDashboard data={data} loading={loading} />
    </>
  );
}
