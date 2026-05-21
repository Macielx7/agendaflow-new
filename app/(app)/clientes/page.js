'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import ClientModal from '@/components/ClientModal/ClientModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { formatPhone, formatDateShort } from '@/utils/format';
import s from '@/styles/saas.module.css';

export default function ClientesPage() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    api.clients(search).then((d) => setClients(d.clients)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search]);

  const handleSave = async (form) => {
    if (selected) {
      await api.updateClient(selected.id, form);
      toast.success('Cliente atualizado');
    } else {
      await api.createClient(form);
      toast.success('Cliente criado');
    }
    load();
  };

  const handleDelete = async () => {
    await api.deleteClient(confirm.id);
    toast.success('Cliente removido');
    setConfirm(null);
    load();
  };

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Clientes</h1>
          <p className={s.pageSubtitle}>Cadastro e histórico de pacientes</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => { setSelected(null); setModal(true); }}><Plus size={18} /> Novo cliente</button>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className={s.input} placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
        </div>
        {loading ? <p className={s.empty}>Carregando...</p> : (
          <div className={s.cardBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {clients.map((c) => (
              <div key={c.id} className={s.mobileCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <strong style={{ fontSize: '1rem' }}>{c.name}</strong>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => { setSelected(c); setModal(true); }} style={{ color: 'var(--accent-hover)' }}><Pencil size={16} /></button>
                    <button type="button" onClick={() => setConfirm(c)} style={{ color: '#f87171' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatPhone(c.phone)}</p>
                {c.email && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.email}</p>}
                <p style={{ fontSize: '0.75rem', marginTop: 12, color: 'var(--text-muted)' }}>
                  {c._count?.appointments || 0} agendamentos
                  {c.appointments?.[0] && ` · Último: ${formatDateShort(c.appointments[0].date)}`}
                </p>
              </div>
            ))}
            {!clients.length && <p className={s.empty} style={{ gridColumn: '1/-1' }}>Nenhum cliente</p>}
          </div>
        )}
      </div>

      <ClientModal isOpen={modal} onClose={() => { setModal(false); setSelected(null); }} onSave={handleSave} client={selected} />
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} title="Excluir cliente" message={`Excluir ${confirm?.name}?`} danger />
    </>
  );
}
