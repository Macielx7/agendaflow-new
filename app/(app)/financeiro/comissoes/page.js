'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { CommissionRulesTable, CommissionHistoryTable } from '@/components/finance/CommissionTable';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { financeApi } from '@/services/financeApi';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/Modal/Modal';
import s from '@/styles/saas.module.css';

export default function ComissoesPage() {
  const toast = useToast();
  const [rules, setRules] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ dentistId: '', dentistName: '', percentage: '', serviceId: '', serviceName: '' });
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      financeApi.commissions({ view: 'rules' }),
      financeApi.commissions(),
      api.services(),
    ])
      .then(([r, c, sv]) => {
        setRules(r.rules);
        setCommissions(c.commissions);
        setServices(sv.services || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await financeApi.createCommissionRule({
        ...form,
        percentage: parseFloat(form.percentage),
      });
      toast.success('Regra criada');
      setModal(false);
      setForm({ dentistId: '', dentistName: '', percentage: '', serviceId: '', serviceName: '' });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Comissões</h1>
          <p className={s.pageSubtitle}>Regras por dentista e histórico calculado</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setModal(true)}>
          <Plus size={18} /> Nova regra
        </button>
      </div>

      <div className={s.card} style={{ marginBottom: 16 }}>
        <div className={s.cardHeader}><h2 className={s.cardTitle}>Regras de comissão</h2></div>
        <div className={s.cardBody}>
          <CommissionRulesTable
            rules={rules}
            loading={loading}
            onEdit={() => {}}
            onDelete={(r) => setConfirm(r)}
          />
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}><h2 className={s.cardTitle}>Comissões calculadas</h2></div>
        <div className={s.cardBody}>
          <CommissionHistoryTable items={commissions} loading={loading} />
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Nova regra de comissão" size="sm">
            <form onSubmit={handleSave}>
              <label className={s.label}>Dentista
                <input
                  className={s.input}
                  value={form.dentistName}
                  onChange={(e) => setForm({ ...form, dentistName: e.target.value, dentistId: e.target.value })}
                  placeholder="Nome do dentista"
                  required
                />
              </label>
              <label className={s.label}>Percentual (%)
                <input type="number" step="0.01" className={s.input} value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} required />
              </label>
              <label className={s.label}>Procedimento (opcional)
                <select className={s.input} value={form.serviceId} onChange={(e) => {
                  const svc = services.find((s) => s.id === e.target.value);
                  setForm({ ...form, serviceId: e.target.value, serviceName: svc?.name || '' });
                }}>
                  <option value="">Todos os procedimentos</option>
                  {services.map((sv) => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
                </select>
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className={s.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className={s.btnPrimary}>Salvar</button>
              </div>
            </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title="Remover regra?"
        message="A regra de comissão será excluída."
        onConfirm={async () => {
          await financeApi.deleteCommissionRule(confirm.id);
          toast.success('Regra removida');
          setConfirm(null);
          load();
        }}
      />
    </>
  );
}
