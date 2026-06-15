'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { financeApi } from '@/services/financeApi';
import { useToast } from '@/context/ToastContext';
import f from '@/styles/finance.module.css';
import Modal from '@/components/Modal/Modal';
import s from '@/styles/saas.module.css';

export default function CategoriasPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'INCOME' });

  const load = useCallback(() => {
    setLoading(true);
    financeApi.categories()
      .then((d) => setCategories(d.categories))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const income = categories.filter((c) => c.type === 'INCOME');
  const expense = categories.filter((c) => c.type === 'EXPENSE');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await financeApi.createCategory(form);
      toast.success('Categoria criada');
      setModal(false);
      setForm({ name: '', type: 'INCOME' });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const CategoryList = ({ items, title }) => (
    <div className={s.card}>
      <div className={s.cardHeader}><h2 className={s.cardTitle}>{title}</h2></div>
      <div className={s.cardBody}>
        {loading ? (
          <div className={`${f.finCard} ${f.skeleton}`} style={{ height: 80 }} />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {items.map((c) => (
              <span key={c.id} className={f.subNavItem} style={{ cursor: 'default' }}>
                {c.name}
                {c.isSystem && <small style={{ opacity: 0.6, marginLeft: 4 }}>· sistema</small>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className={s.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={s.pageTitle}>Categorias Financeiras</h1>
          <p className={s.pageSubtitle}>Receitas e despesas da clínica</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setModal(true)}>
          <Plus size={18} /> Nova categoria
        </button>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <CategoryList items={income} title="Receitas" />
        <CategoryList items={expense} title="Despesas" />
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Nova categoria" size="sm">
            <form onSubmit={handleSave}>
              <label className={s.label}>Nome<input className={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label className={s.label}>Tipo
                <select className={s.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className={s.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className={s.btnPrimary}>Salvar</button>
              </div>
            </form>
      </Modal>
    </>
  );
}
