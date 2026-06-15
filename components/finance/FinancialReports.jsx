'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { financeApi } from '@/services/financeApi';
import { formatCurrency } from '@/utils/format';
import { useToast } from '@/context/ToastContext';
import f from '@/styles/finance.module.css';
import s from '@/styles/saas.module.css';

const REPORT_TYPES = [
  { value: 'revenue', label: 'Receitas' },
  { value: 'expenses', label: 'Despesas' },
  { value: 'profit', label: 'Lucro' },
  { value: 'commissions', label: 'Comissões' },
  { value: 'procedures', label: 'Procedimentos' },
];

function downloadCSV(columns, rows, filename) {
  const header = columns.join(';');
  const body = rows.map((r) => r.join(';')).join('\n');
  const blob = new Blob(['\ufeff' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printReport(columns, rows, title) {
  const html = `
    <html><head><title>${title}</title>
    <style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
    </head><body><h1>${title}</h1><table><thead><tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}

export default function FinancialReports() {
  const toast = useToast();
  const [type, setType] = useState('revenue');
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await financeApi.report({ type, from, to });
      setReport(data.report);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={f.financeWrap}>
      <div className={s.card}>
        <div className={s.cardBody}>
          <div className={s.filters} style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <select className={s.input} value={type} onChange={(e) => setType(e.target.value)}>
              {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input type="date" className={s.input} value={from} onChange={(e) => setFrom(e.target.value)} />
            <input type="date" className={s.input} value={to} onChange={(e) => setTo(e.target.value)} />
            <button type="button" className={s.btnPrimary} onClick={load} disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar relatório'}
            </button>
          </div>

          {report && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <button type="button" className={s.btnSecondary} onClick={() => downloadCSV(report.columns, report.rows, `relatorio-${type}.csv`)}>
                  <Download size={16} /> Excel (CSV)
                </button>
                <button type="button" className={s.btnSecondary} onClick={() => printReport(report.columns, report.rows, `Relatório ${type}`)}>
                  <FileText size={16} /> PDF (imprimir)
                </button>
              </div>
              {report.summary && (
                <div className={f.cashSummary}>
                  <div className={f.cashBox}><h4>Receitas</h4><strong className={f.positive}>{formatCurrency(report.summary.revenue)}</strong></div>
                  <div className={f.cashBox}><h4>Despesas</h4><strong className={f.negative}>{formatCurrency(report.summary.expenses)}</strong></div>
                  <div className={f.cashBox}><h4>Lucro</h4><strong>{formatCurrency(report.summary.profit)}</strong></div>
                </div>
              )}
              <div className={f.tableWrap}>
                <table className={s.table}>
                  <thead><tr>{report.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>
                    {report.rows.map((row, i) => (
                      <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
