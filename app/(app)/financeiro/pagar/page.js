'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import AccountsPayableTable from '@/components/finance/AccountsPayableTable';
import PayableModal from '@/components/finance/PayableModal';
import PaymentModal from '@/components/finance/PaymentModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import FinancialFilters from '@/components/finance/FinancialFilters';
import { financeApi } from '@/services/financeApi';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/saas.module.css';

const STATUS_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAID', label: 'Pago' },
  { value: 'OVERDUE', label: 'Vencido' },
];

export default function PagarPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    financeApi.payables({ status, search })
      .then((d) => setItems(d.payables))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [status, search, toast]);

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleSave = async (form) => {
    try {
      if (selected) {
        await financeApi.updatePayable(selected.id, form);
        toast.success('Conta atualizada');
      } else {
        await financeApi.createPayable(form);
        toast.success('Conta criada');
      }
      load();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handlePay = async (data) => {
    try {
      await financeApi.updatePayable(payModal.id, data);
      toast.success('Pagamento registrado');
      setPayModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Contas a Pagar</h1>
          <p className={s.pageSubtitle}>Despesas e fornecedores</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => { setSelected(null); setModal(true); }}>
          <Plus size={18} /> Nova despesa
        </button>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className={s.input} style={{ paddingLeft: 36 }} placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <FinancialFilters options={STATUS_OPTS} value={status} onChange={setStatus} />
        </div>
        <div className={s.cardBody}>
          <AccountsPayableTable
            items={items}
            loading={loading}
            onEdit={(item) => { setSelected(item); setModal(true); }}
            onDelete={(item) => setConfirm(item)}
            onPay={(item) => setPayModal(item)}
          />
        </div>
      </div>

      <PayableModal open={modal} onClose={() => setModal(false)} onSave={handleSave} item={selected} />
      <PaymentModal open={!!payModal} onClose={() => setPayModal(null)} onSave={handlePay} amount={payModal?.amount} title={`Pagar: ${payModal?.description}`} />
      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title="Cancelar conta?"
        message="A conta será marcada como cancelada."
        onConfirm={async () => {
          await financeApi.deletePayable(confirm.id);
          toast.success('Conta cancelada');
          setConfirm(null);
          load();
        }}
      />
    </>
  );
}
