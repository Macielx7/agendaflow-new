'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal/Modal';
import { api } from '@/services/api';
import { PAYMENT_METHODS } from '@/lib/finance/defaults';
import f from '@/styles/finance.module.css';
import s from '@/styles/saas.module.css';

export default function BudgetModal({ open, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    clientId: '',
    title: '',
    discount: 0,
    installmentsCount: 1,
    firstDueDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'PIX',
    dentistName: '',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, serviceId: '' }],
    approve: true,
  });

  useEffect(() => {
    if (!open) return;
    Promise.all([api.clients(), api.services()]).then(([c, sv]) => {
      setClients(c.clients || []);
      setServices(sv.services || []);
    });
  }, [open]);

  const total = form.items.reduce((s, i) => s + (parseFloat(i.unitPrice) || 0) * (parseInt(i.quantity, 10) || 1), 0);
  const final = Math.max(total - (parseFloat(form.discount) || 0), 0);

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0, serviceId: '' }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const handleServicePick = (idx, serviceId) => {
    const svc = services.find((s) => s.id === serviceId);
    const items = [...form.items];
    items[idx] = { ...items[idx], serviceId, description: svc?.name || items[idx].description, unitPrice: parseFloat(svc?.price || 0) };
    setForm({ ...form, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...form,
      discount: parseFloat(form.discount) || 0,
      installmentsCount: parseInt(form.installmentsCount, 10) || 1,
      items: form.items.map((i) => ({ ...i, quantity: parseInt(i.quantity, 10) || 1, unitPrice: parseFloat(i.unitPrice) || 0 })),
    });
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Novo orçamento / plano de tratamento" size="lg">
      <form onSubmit={handleSubmit}>
        <label className={s.label}>Cliente
          <select className={s.input} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
            <option value="">Selecione</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className={s.label}>Título do tratamento
          <input className={s.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Ex: Lente de contato dental" />
        </label>
        <label className={s.label}>Dentista responsável
          <input className={s.input} value={form.dentistName} onChange={(e) => setForm({ ...form, dentistName: e.target.value })} />
        </label>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>Procedimentos</strong>
            <button type="button" className={s.btnSecondary} onClick={addItem}><Plus size={14} /> Adicionar</button>
          </div>
          {form.items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div>
                <select className={s.input} value={item.serviceId} onChange={(e) => handleServicePick(idx, e.target.value)}>
                  <option value="">Procedimento</option>
                  {services.map((sv) => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
                </select>
                <input className={s.input} style={{ marginTop: 4 }} value={item.description} onChange={(e) => {
                  const items = [...form.items];
                  items[idx].description = e.target.value;
                  setForm({ ...form, items });
                }} placeholder="Descrição" required />
              </div>
              <input type="number" className={s.input} min="1" value={item.quantity} onChange={(e) => {
                const items = [...form.items];
                items[idx].quantity = e.target.value;
                setForm({ ...form, items });
              }} />
              <input type="number" step="0.01" className={s.input} value={item.unitPrice} onChange={(e) => {
                const items = [...form.items];
                items[idx].unitPrice = e.target.value;
                setForm({ ...form, items });
              }} />
              <button type="button" className={f.iconBtn} onClick={() => removeItem(idx)} disabled={form.items.length === 1}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
          <label className={s.label}>Desconto (R$)
            <input type="number" step="0.01" className={s.input} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          </label>
          <label className={s.label}>Parcelas
            <input type="number" min="1" className={s.input} value={form.installmentsCount} onChange={(e) => setForm({ ...form, installmentsCount: e.target.value })} />
          </label>
          <label className={s.label}>1º vencimento
            <input type="date" className={s.input} value={form.firstDueDate} onChange={(e) => setForm({ ...form, firstDueDate: e.target.value })} />
          </label>
        </div>

        <label className={s.label}>Forma de pagamento
          <select className={s.input} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>

        <div style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, marginTop: 8 }}>
          <div>Total: R$ {total.toFixed(2)}</div>
          <div><strong>Valor final: R$ {final.toFixed(2)}</strong></div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {form.installmentsCount}x de R$ {(final / (parseInt(form.installmentsCount, 10) || 1)).toFixed(2)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.btnPrimary}>Aprovar e gerar parcelas</button>
        </div>
      </form>
    </Modal>
  );
}
