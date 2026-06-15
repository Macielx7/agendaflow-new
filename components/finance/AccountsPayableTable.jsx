'use client';

import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/format';
import { STATUS_LABELS } from '@/lib/finance/defaults';
import f from '@/styles/finance.module.css';
import s from '@/styles/saas.module.css';

export default function AccountsPayableTable({ items, onEdit, onDelete, onPay, loading }) {
  if (loading) {
    return <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 200 }} />;
  }
  if (!items?.length) {
    return <p className={s.empty}>Nenhuma conta a pagar</p>;
  }
  return (
    <div className={f.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Fornecedor</th>
            <th>Categoria</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Pagamento</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.description}</strong></td>
              <td>{item.supplier || '—'}</td>
              <td>{item.category?.name || '—'}</td>
              <td>{formatCurrency(item.amount)}</td>
              <td>{formatDateShort(item.dueDate)}</td>
              <td>{item.paidAt ? formatDateShort(item.paidAt) : '—'}</td>
              <td>
                <span className={`${f.statusBadge} ${f[`status${item.status}`]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  {item.status !== 'PAID' && item.status !== 'CANCELLED' && (
                    <button type="button" className={f.iconBtn} onClick={() => onPay?.(item)} title="Registrar pagamento">
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button type="button" className={f.iconBtn} onClick={() => onEdit(item)}><Pencil size={16} /></button>
                  <button type="button" className={`${f.iconBtn} ${f.iconBtnDanger}`} onClick={() => onDelete(item)}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
