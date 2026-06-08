'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import AppointmentTable from '@/components/AppointmentTable/AppointmentTable';
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { STATUS_LABELS } from '@/lib/validations';
import s from '@/styles/saas.module.css';

export default function AgendamentosPage() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    if (createdFrom) params.createdFrom = createdFrom;
    if (createdTo) params.createdTo = createdTo;
    api
      .appointments(params)
      .then((d) => setList(d.appointments))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [status, search, dateFrom, dateTo, createdFrom, createdTo, toast]);

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => {
    api.clients().then((d) => setClients(d.clients));
    api.services().then((d) => setServices(d.services));
  }, []);

  const handleSave = async (form) => {
    if (selected) {
      await api.updateAppointment(selected.id, form);
      toast.success('Atualizado');
    } else {
      await api.createAppointment(form);
      toast.success('Criado');
    }
    load();
  };

  const handleCancel = async () => {
    try {
      await api.cancelAppointment(confirm.id);
      toast.success('Agendamento excluído');
      setConfirm(null);
      setModal(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const clearFilters = () => {
    setStatus('all');
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setCreatedFrom('');
    setCreatedTo('');
  };

  const hasFilters = status !== 'all' || search || dateFrom || dateTo || createdFrom || createdTo;

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Agendamentos</h1>
          <p className={s.pageSubtitle}>Gerencie todos os agendamentos</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => { setSelected(null); setModal(true); }}>
          <Plus size={18} /> Novo
        </button>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.filters} style={{ flexWrap: 'wrap', width: '100%' }}>
            <div style={{ position: 'relative', flex: '1 1 180px' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className={s.filterInput}
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36, width: '100%' }}
              />
            </div>
            <select className={s.select} value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              type="date"
              className={s.filterInput}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Data do atendimento (de)"
              style={{ width: 'auto' }}
            />
            <input
              type="date"
              className={s.filterInput}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Data do atendimento (até)"
              style={{ width: 'auto' }}
            />
            <input
              type="date"
              className={s.filterInput}
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              title="Cadastrado no sistema (de)"
              style={{ width: 'auto' }}
            />
            <input
              type="date"
              className={s.filterInput}
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              title="Cadastrado no sistema (até)"
              style={{ width: 'auto' }}
            />
            {hasFilters && (
              <button type="button" className={s.btnSecondary} onClick={clearFilters} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Limpar
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12, width: '100%' }}>
            Primeiras datas = dia do atendimento · Últimas datas = dia em que o agendamento foi criado no sistema.
          </p>
        </div>
        <AppointmentTable
          appointments={list}
          loading={loading}
          onEdit={(apt) => { setSelected(apt); setModal(true); }}
          onCancel={(apt) => setConfirm(apt)}
        />
      </div>

      <AppointmentModal
        isOpen={modal}
        onClose={() => { setModal(false); setSelected(null); }}
        onSave={handleSave}
        onDelete={(apt) => setConfirm(apt)}
        appointment={selected}
        clients={clients}
        services={services}
        onClientsChange={setClients}
      />
      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleCancel}
        title="Excluir agendamento"
        message={`Excluir o agendamento de ${confirm?.client?.name}?`}
        danger
      />
    </>
  );
}
