'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import ClientModal from '@/components/ClientModal/ClientModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { formatPhone, formatDateShort, formatCPF } from '@/utils/format';
import s from '@/styles/saas.module.css';

const CLIENT_FILTERS = [
  { value: 'all', label: 'Todos os clientes' },
  { value: 'consulted', label: 'Já consultaram' },
  { value: 'no_show', label: 'Faltosos' },
  { value: 'never_consulted', label: 'Agendados, sem consulta' },
  { value: 'has_appointments', label: 'Com agendamentos' },
  { value: 'no_appointments', label: 'Sem agendamentos' },
];

export default function ClientesPage() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .clients({ search, category, createdFrom, createdTo })
      .then((d) => setClients(d.clients))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [search, category, createdFrom, createdTo, toast]);

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleSave = async (form) => {
    try {
      if (selected) {
        await api.updateClient(selected.id, form);
        toast.success('Cliente atualizado');
      } else {
        await api.createClient(form);
        toast.success('Cliente criado');
      }
      load();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteClient(confirm.id);
      toast.success('Cliente removido');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const clearFilters = () => {
    setCategory('all');
    setCreatedFrom('');
    setCreatedTo('');
    setSearch('');
  };

  const hasFilters = category !== 'all' || createdFrom || createdTo || search;

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Clientes</h1>
          <p className={s.pageSubtitle}>Cadastro, histórico e filtros de pacientes</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => { setSelected(null); setModal(true); }}>
          <Plus size={18} /> Novo cliente
        </button>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.filters} style={{ flexWrap: 'wrap', width: '100%' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className={s.filterInput}
                placeholder="Buscar nome, CPF, telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36, width: '100%' }}
              />
            </div>
            <select className={s.select} value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
              {CLIENT_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <input
              type="date"
              className={s.filterInput}
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              title="Cadastrado a partir de"
              style={{ width: 'auto' }}
            />
            <input
              type="date"
              className={s.filterInput}
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              title="Cadastrado até"
              style={{ width: 'auto' }}
            />
            {hasFilters && (
              <button type="button" className={s.btnSecondary} onClick={clearFilters} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Limpar filtros
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12, width: '100%' }}>
            Use as datas para filtrar o dia em que o cliente foi cadastrado no sistema.
          </p>
        </div>
        {loading ? (
          <p className={s.empty}>Carregando...</p>
        ) : (
          <div className={s.cardBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {clients.map((c) => (
              <div key={c.id} className={s.mobileCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <strong style={{ fontSize: '1rem' }}>{c.name}</strong>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => { setSelected(c); setModal(true); }} style={{ color: 'var(--accent-hover)' }} aria-label="Editar">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => setConfirm(c)} style={{ color: '#f87171' }} aria-label="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {c.stats?.hasConsulted && (
                    <span className={`${s.badge} ${s.badgeCOMPLETED}`} style={{ fontSize: '0.7rem' }}>Já consultou</span>
                  )}
                  {c.stats?.isNoShow && (
                    <span className={`${s.badge} ${s.badgeNO_SHOW}`} style={{ fontSize: '0.7rem' }}>Faltoso</span>
                  )}
                  {c.stats?.totalAppointments === 0 && (
                    <span className={s.badge} style={{ fontSize: '0.7rem', background: 'rgba(156,163,175,0.15)', color: '#9ca3af' }}>Sem agendamentos</span>
                  )}
                </div>
                {c.cpf && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatCPF(c.cpf)}</p>}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatPhone(c.phone)}</p>
                {c.email && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.email}</p>}
                <div style={{ fontSize: '0.78rem', marginTop: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <p><strong style={{ color: 'var(--text-secondary)' }}>Cadastrado em:</strong> {formatDateShort(c.createdAt)}</p>
                  <p><strong style={{ color: 'var(--text-secondary)' }}>Agendamentos:</strong> {c.stats?.totalAppointments ?? c._count?.appointments ?? 0}</p>
                  {c.stats?.lastCompletedDate && (
                    <p><strong style={{ color: 'var(--text-secondary)' }}>Última consulta:</strong> {formatDateShort(c.stats.lastCompletedDate)}</p>
                  )}
                  {c.stats?.lastNoShowDate && (
                    <p><strong style={{ color: '#f87171' }}>Última falta:</strong> {formatDateShort(c.stats.lastNoShowDate)}</p>
                  )}
                  {c.stats?.lastAppointmentDate && !c.stats?.lastCompletedDate && (
                    <p><strong style={{ color: 'var(--text-secondary)' }}>Último agendamento:</strong> {formatDateShort(c.stats.lastAppointmentDate)}</p>
                  )}
                </div>
              </div>
            ))}
            {!clients.length && (
              <p className={s.empty} style={{ gridColumn: '1/-1' }}>
                Nenhum cliente encontrado com esses filtros
              </p>
            )}
          </div>
        )}
      </div>

      <ClientModal isOpen={modal} onClose={() => { setModal(false); setSelected(null); }} onSave={handleSave} client={selected} />
      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Excluir cliente"
        message={
          confirm?._count?.appointments > 0 || confirm?.stats?.totalAppointments > 0
            ? `Excluir ${confirm?.name}? O histórico de ${confirm?.stats?.totalAppointments ?? confirm?._count?.appointments} agendamento(s) também será removido.`
            : `Excluir ${confirm?.name}?`
        }
        danger
      />
    </>
  );
}
