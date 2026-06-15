'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import BudgetModal from '@/components/finance/BudgetModal';
import { financeApi } from '@/services/financeApi';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDateShort } from '@/utils/format';
import f from '@/styles/finance.module.css';
import s from '@/styles/saas.module.css';

export default function OrcamentosPage() {
  const toast = useToast();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    financeApi.budgets()
      .then((d) => setBudgets(d.budgets))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    try {
      await financeApi.createBudget(form);
      toast.success('Orçamento aprovado com parcelas geradas');
      load();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Orçamentos</h1>
          <p className={s.pageSubtitle}>Planos de tratamento com parcelamento automático</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setModal(true)}>
          <Plus size={18} /> Novo orçamento
        </button>
      </div>

      <div className={s.card}>
        <div className={s.cardBody}>
          {loading ? (
            <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 120 }} />
          ) : budgets.length === 0 ? (
            <p className={s.empty}>Nenhum orçamento cadastrado</p>
          ) : (
            <div className={f.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Tratamento</th>
                    <th>Total</th>
                    <th>Desconto</th>
                    <th>Final</th>
                    <th>Parcelas</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.client?.name}</strong></td>
                      <td>{b.title}</td>
                      <td>{formatCurrency(b.totalAmount)}</td>
                      <td>{formatCurrency(b.discount)}</td>
                      <td>{formatCurrency(b.finalAmount)}</td>
                      <td>{b.installmentsCount}x</td>
                      <td>
                        <span className={`${f.statusBadge} ${b.status === 'APPROVED' ? f.statusPAID : f.statusPENDING}`}>
                          {b.status === 'APPROVED' ? 'Aprovado' : b.status === 'CANCELLED' ? 'Cancelado' : 'Rascunho'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BudgetModal open={modal} onClose={() => setModal(false)} onSave={handleSave} />
    </>
  );
}
