'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TenantTable from '@/components/superadmin/TenantTable';
import Modal from '@/components/Modal/Modal';
import { superApi } from '@/services/superadminApi';
import { useToast } from '@/context/ToastContext';
import { TENANT_STATUS } from '@/utils/superConstants';
import s from '@/styles/superadmin.module.css';

export default function TenantsPage() {
  const router = useRouter();
  const toast = useToast();
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ companyName: '', ownerName: '', email: '', phone: '', planId: '', adminPassword: 'Admin@2024!' });

  const load = () => {
    const params = {};
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    superApi.tenants(params).then((d) => setTenants(d.tenants));
  };

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, status]);

  useEffect(() => {
    superApi.plans().then((d) => setPlans(d.plans));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await superApi.createTenant(form);
      toast.success('Conta criada');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAction = async (action, t) => {
    if (action === 'view') router.push(`/superadmin/tenants/${t.id}`);
    if (action === 'impersonate') {
      try {
        const res = await superApi.impersonate(t.id);
        window.location.href = res.redirect || '/dashboard';
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div><h1 className={s.pageTitle}>Clientes SaaS</h1><p className={s.pageSubtitle}>Gerencie todas as contas da plataforma</p></div>
        <button type="button" className={s.btnPrimary} onClick={() => setModal(true)}><Plus size={18} /> Nova conta</button>
      </div>
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.filters}>
            <div style={{ position: 'relative' }}><Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} /><input className={s.filterInput} placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} /></div>
            <select className={s.select} value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">Todos</option>
              {Object.entries(TENANT_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <TenantTable tenants={tenants} onAction={handleAction} />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Nova conta SaaS" size="md">
        <form onSubmit={create}>
          <div className={s.formGroup}><label className={s.label}>Empresa</label><input className={s.input} value={form.companyName} onChange={(e) => setF('companyName', e.target.value)} required /></div>
          <div className={s.formGroup}><label className={s.label}>Responsável</label><input className={s.input} value={form.ownerName} onChange={(e) => setF('ownerName', e.target.value)} /></div>
          <div className={s.formGroup}><label className={s.label}>E-mail admin</label><input type="email" className={s.input} value={form.email} onChange={(e) => setF('email', e.target.value)} required /></div>
          <div className={s.formGroup}><label className={s.label}>WhatsApp</label><input className={s.input} value={form.phone} onChange={(e) => setF('phone', e.target.value)} /></div>
          <div className={s.formGroup}><label className={s.label}>Plano</label><select className={s.select} value={form.planId} onChange={(e) => setF('planId', e.target.value)} required><option value="">Selecione</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className={s.formGroup}><label className={s.label}>Senha inicial</label><input className={s.input} value={form.adminPassword} onChange={(e) => setF('adminPassword', e.target.value)} /></div>
          <button type="submit" className={s.btnPrimary}>Criar conta</button>
        </form>
      </Modal>
    </>
  );
}
