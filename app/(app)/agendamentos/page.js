'use client';

import { useEffect, useState } from 'react';
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
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    api.appointments(params).then((d) => setList(d.appointments)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [status, search]);

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
    await api.cancelAppointment(confirm.id);
    toast.success('Cancelado');
    setConfirm(null);
    load();
  };

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
          <div className={s.filters}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className={s.filterInput} placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            <select className={s.select} value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">Todos</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <AppointmentTable
          appointments={list}
          loading={loading}
          onEdit={(apt) => { setSelected(apt); setModal(true); }}
          onCancel={(apt) => setConfirm(apt)}
        />
      </div>

      <AppointmentModal isOpen={modal} onClose={() => { setModal(false); setSelected(null); }} onSave={handleSave} appointment={selected} clients={clients} services={services} />
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleCancel} title="Cancelar agendamento" message={`Cancelar agendamento de ${confirm?.client?.name}?`} danger />
    </>
  );
}
