'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Send } from 'lucide-react';
import InstallmentsTable from '@/components/finance/InstallmentsTable';
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

export default function ParcelamentosPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    financeApi.installments({ status, search })
      .then((d) => setItems(d.installments))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [status, search, toast]);

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handlePay = async (item) => {
    try {
      await financeApi.updateInstallment(item.id, { markPaid: true });
      toast.success('Parcela paga');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemindAll = async () => {
    try {
      const r = await financeApi.sendReminders();
      toast.success(`${r.sent} lembretes enviados`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Parcelamentos</h1>
          <p className={s.pageSubtitle}>Parcelas de tratamentos e planos</p>
        </div>
        <button type="button" className={s.btnSecondary} onClick={handleRemindAll}>
          <Send size={16} /> Enviar lembretes WhatsApp
        </button>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className={s.input} style={{ paddingLeft: 36 }} placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <FinancialFilters options={STATUS_OPTS} value={status} onChange={setStatus} />
        </div>
        <div className={s.cardBody}>
          <InstallmentsTable items={items} loading={loading} onPay={handlePay} onRemind={handleRemindAll} />
        </div>
      </div>
    </>
  );
}
