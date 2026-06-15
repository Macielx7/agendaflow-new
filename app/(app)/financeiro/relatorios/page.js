'use client';

import FinancialReports from '@/components/finance/FinancialReports';
import s from '@/styles/saas.module.css';

export default function RelatoriosPage() {
  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Relatórios</h1>
        <p className={s.pageSubtitle}>Exportação em Excel e PDF</p>
      </div>
      <FinancialReports />
    </>
  );
}
