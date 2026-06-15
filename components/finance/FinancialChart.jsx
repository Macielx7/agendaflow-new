'use client';

import { formatCurrency } from '@/utils/format';
import f from '@/styles/finance.module.css';

export function BarChart({ data, valueKey = 'value', labelKey = 'label', title }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className={f.chartBox}>
      {title && <h3 className={f.chartTitle}>{title}</h3>}
      <div className={f.barChart}>
        {data.map((d, i) => (
          <div key={i} className={f.barCol}>
            <div
              className={f.bar}
              style={{ height: `${Math.max(((d[valueKey] || 0) / max) * 140, 4)}px` }}
              title={`${d[labelKey]}: ${formatCurrency(d[valueKey])}`}
            />
            <span className={f.barLabel}>{d[labelKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HorizontalBarChart({ data, valueKey = 'value', labelKey = 'name', title }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className={f.chartBox}>
      {title && <h3 className={f.chartTitle}>{title}</h3>}
      {data.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sem dados no período</p>
      ) : (
        data.map((d, i) => (
          <div key={i} className={f.hBarRow}>
            <span className={f.hBarLabel}>{d[labelKey]}</span>
            <div className={f.hBarTrack}>
              <div className={f.hBarFill} style={{ width: `${((d[valueKey] || 0) / max) * 100}%` }} />
            </div>
            <span className={f.hBarValue}>{formatCurrency(d[valueKey])}</span>
          </div>
        ))
      )}
    </div>
  );
}

export function CashFlowChart({ data, title }) {
  const max = Math.max(...data.flatMap((d) => [d.inflow || 0, d.outflow || 0]), 1);
  return (
    <div className={f.chartBox}>
      {title && <h3 className={f.chartTitle}>{title}</h3>}
      <div className={f.barChart}>
        {data.slice(-14).map((d, i) => (
          <div key={i} className={f.barCol}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%' }}>
              <div
                className={f.bar}
                style={{
                  height: `${Math.max(((d.inflow || 0) / max) * 70, 2)}px`,
                  background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                }}
              />
              <div
                className={f.bar}
                style={{
                  height: `${Math.max(((d.outflow || 0) / max) * 70, 2)}px`,
                  background: 'linear-gradient(180deg, #ef4444, #dc2626)',
                }}
              />
            </div>
            <span className={f.barLabel}>{d.date?.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FinancialChart({ type, data, title, ...props }) {
  if (type === 'horizontal') return <HorizontalBarChart data={data} title={title} {...props} />;
  if (type === 'cashflow') return <CashFlowChart data={data} title={title} />;
  return <BarChart data={data} title={title} {...props} />;
}
