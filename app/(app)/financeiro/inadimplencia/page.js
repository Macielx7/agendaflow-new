'use client';

import { useCallback, useEffect, useState } from 'react';
import FinancialFilters from '@/components/finance/FinancialFilters';
import { financeApi } from '@/services/financeApi';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDateShort, formatCPF, formatPhone } from '@/utils/format';
import f from '@/styles/finance.module.css';
import s from '@/styles/saas.module.css';

const RANGE_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: '30', label: 'Até 30 dias' },
  { value: '60', label: '31–60 dias' },
  { value: '90', label: '61–90 dias' },
  { value: '120', label: '120+ dias' },
];

export default function InadimplenciaPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    financeApi.delinquency({ range })
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [range, toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Inadimplência</h1>
        <p className={s.pageSubtitle}>Clientes e parcelas em atraso</p>
      </div>

      <div className={f.cashSummary}>
        <div className={f.cashBox}>
          <h4>Total em atraso</h4>
          <strong className={f.negative}>{formatCurrency(data?.totalOverdue || 0)}</strong>
        </div>
        <div className={f.cashBox}>
          <h4>Clientes inadimplentes</h4>
          <strong>{data?.clientCount ?? 0}</strong>
        </div>
        <div className={f.cashBox}>
          <h4>Parcelas vencidas</h4>
          <strong>{data?.itemCount ?? 0}</strong>
        </div>
      </div>

      <div className={s.card} style={{ marginBottom: 16 }}>
        <div className={s.cardHeader}>
          <FinancialFilters options={RANGE_OPTS} value={range} onChange={setRange} />
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardBody}>
          {loading ? (
            <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 160 }} />
          ) : !data?.clients?.length ? (
            <p className={s.empty}>Nenhum cliente inadimplente no filtro</p>
          ) : (
            <div className={f.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>CPF</th>
                    <th>Dias em atraso</th>
                    <th>Total em atraso</th>
                    <th>Itens</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clients.map((c) => (
                    <tr key={c.clientId || c.clientName}>
                      <td><strong>{c.clientName}</strong></td>
                      <td>{formatCPF(c.clientCpf)}</td>
                      <td><span className={`${f.statusBadge} ${f.statusOVERDUE}`}>{c.maxDays} dias</span></td>
                      <td>{formatCurrency(c.totalOverdue)}</td>
                      <td>{c.items.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {!loading && data?.items?.length > 0 && (
        <div className={s.card} style={{ marginTop: 16 }}>
          <div className={s.cardHeader}><h2 className={s.cardTitle}>Parcelas vencidas</h2></div>
          <div className={s.cardBody} style={{ padding: 0 }}>
            {data.items.map((item) => (
              <div key={item.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{item.clientName}</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.description} · Venceu {formatDateShort(item.dueDate)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</span>
                  <span className={`${f.statusBadge} ${f.statusOVERDUE}`} style={{ display: 'block', marginTop: 4 }}>{item.daysOverdue} dias</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
