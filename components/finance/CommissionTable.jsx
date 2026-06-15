'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import f from '@/styles/finance.module.css';
import s from '@/styles/saas.module.css';

export function CommissionRulesTable({ rules, onEdit, onDelete, loading }) {
  if (loading) return <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 120 }} />;
  if (!rules?.length) return <p className={s.empty}>Nenhuma regra de comissão</p>;
  return (
    <div className={f.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Dentista</th>
            <th>Percentual</th>
            <th>Procedimento</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id}>
              <td><strong>{r.dentistName}</strong></td>
              <td>{r.percentage}%</td>
              <td>{r.serviceName || 'Todos'}</td>
              <td>{r.active ? 'Ativo' : 'Inativo'}</td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className={f.iconBtn} onClick={() => onEdit(r)}><Pencil size={16} /></button>
                  <button type="button" className={`${f.iconBtn} ${f.iconBtnDanger}`} onClick={() => onDelete(r)}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CommissionHistoryTable({ items, loading }) {
  if (loading) return <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 120 }} />;
  if (!items?.length) return <p className={s.empty}>Nenhuma comissão calculada</p>;
  return (
    <div className={f.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Dentista</th>
            <th>Base</th>
            <th>%</th>
            <th>Comissão</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.referenceMonth}</td>
              <td><strong>{c.dentistName}</strong></td>
              <td>{formatCurrency(c.baseAmount)}</td>
              <td>{c.percentage}%</td>
              <td>{formatCurrency(c.commissionAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CommissionRulesTable;
