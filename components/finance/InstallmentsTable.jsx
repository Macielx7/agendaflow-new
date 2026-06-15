'use client';

import { CheckCircle, MessageCircle } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/format';
import { STATUS_LABELS } from '@/lib/finance/defaults';
import f from '@/styles/finance.module.css';
import s from '@/styles/saas.module.css';

export default function InstallmentsTable({ items, onPay, onRemind, loading }) {
  if (loading) {
    return <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 200 }} />;
  }
  if (!items?.length) {
    return <p className={s.empty}>Nenhum parcelamento</p>;
  }
  return (
    <div className={f.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Tratamento</th>
            <th>Parcela</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.clientName}</strong></td>
              <td>{item.description}</td>
              <td>#{item.number}</td>
              <td>{formatCurrency(item.amount)}</td>
              <td>{formatDateShort(item.dueDate)}</td>
              <td>
                <span className={`${f.statusBadge} ${f[`status${item.status}`]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  {item.status !== 'PAID' && item.status !== 'CANCELLED' && (
                    <>
                      <button type="button" className={f.iconBtn} onClick={() => onPay?.(item)} title="Marcar como pago">
                        <CheckCircle size={16} />
                      </button>
                      <button type="button" className={f.iconBtn} onClick={() => onRemind?.(item)} title="Enviar lembrete">
                        <MessageCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
