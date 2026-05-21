'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ServiceModal from '@/components/ServiceModal/ServiceModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/utils/format';
import s from '@/styles/saas.module.css';

export default function ServicosPage() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () => api.services().then((d) => setServices(d.services));

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (selected) {
      await api.updateService(selected.id, form);
      toast.success('Serviço atualizado');
    } else {
      await api.createService(form);
      toast.success('Serviço criado');
    }
    load();
  };

  const handleDelete = async () => {
    await api.deleteService(confirm.id);
    toast.success('Serviço removido/desativado');
    setConfirm(null);
    load();
  };

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Serviços</h1>
          <p className={s.pageSubtitle}>Procedimentos e valores</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => { setSelected(null); setModal(true); }}><Plus size={18} /> Novo serviço</button>
      </div>

      <div className={s.card}>
        <div className={s.cardBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {services.map((sv) => (
            <div key={sv.id} className={s.mobileCard} style={{ opacity: sv.active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <strong>{sv.name}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => { setSelected(sv); setModal(true); }}><Pencil size={16} /></button>
                  <button type="button" onClick={() => setConfirm(sv)} style={{ color: '#f87171' }}><Trash2 size={16} /></button>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sv.description}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.875rem' }}>
                <span>{sv.duration} min</span>
                <strong style={{ color: 'var(--accent-hover)' }}>{formatCurrency(sv.price)}</strong>
                {!sv.active && <span style={{ color: '#f87171' }}>Inativo</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ServiceModal isOpen={modal} onClose={() => { setModal(false); setSelected(null); }} onSave={handleSave} service={selected} />
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} title="Remover serviço" message={`Remover ${confirm?.name}?`} danger />
    </>
  );
}
