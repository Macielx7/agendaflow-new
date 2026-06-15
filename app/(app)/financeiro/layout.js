'use client';

import FinanceSubNav from '@/components/finance/FinanceSubNav';
import f from '@/styles/finance.module.css';

export default function FinanceiroLayout({ children }) {
  return (
    <div className={f.financeWrap}>
      <FinanceSubNav />
      {children}
    </div>
  );
}
