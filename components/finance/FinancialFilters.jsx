'use client';

import f from '@/styles/finance.module.css';

export default function FinancialFilters({ options, value, onChange }) {
  return (
    <div className={f.filterPills}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${f.filterPill} ${value === opt.value ? f.filterPillActive : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
