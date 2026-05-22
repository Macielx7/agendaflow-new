'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogIn, Pause, Play, Trash2 } from 'lucide-react';
import { superApi } from '@/services/superadminApi';
import { useToast } from '@/context/ToastContext';
import { TENANT_STATUS, SUB_STATUS, MODULES } from '@/utils/superConstants';
import { formatDateShort } from '@/utils/format';
import s from '@/styles/superadmin.module.css';

export default function TenantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [tenant, setTenant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);

  const load = () => {
    superApi.tenant(id).then((d) => {
      setTenant(d.tenant);
      const mods = MODULES.map((m) => {
        const f = d.tenant.featurePermissions?.find((x) => x.module === m.key);
        return { module: m.key, label: m.label, enabled: f?.enabled ?? true };
      });
      setFeatures(mods);
    });
  };

  useEffect(() => {
    load();
    superApi.plans().then((d) => setPlans(d.plans));
  }, [id]);

  const updateStatus = async (status) => {
    await superApi.updateTenant(id, { status });
    toast.success('Status atualizado');
    load();
  };

  const updatePlan = async (planId) => {
    await superApi.updateTenant(id, { planId });
    toast.success('Plano alterado');
    load();
  };

  const saveFeatures = async () => {
    await superApi.updateFeatures(id, features);
    toast.success('Permissões salvas');
  };

  const impersonate = async () => {
    const res = await superApi.impersonate(id);
    window.location.href = res.redirect || '/dashboard';
  };

  if (!tenant) return <p className={s.empty}>Carregando...</p>;

  return (
    <>
      <Link href="/superadmin/tenants" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#71717a', marginBottom: 24, fontSize: '0.9rem' }}><ArrowLeft size={18} /> Voltar</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 className={s.pageTitle}>{tenant.companyName}</h1>
          <p className={s.pageSubtitle}>{tenant.ownerName} · {tenant.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className={s.btnPrimary} onClick={impersonate}><LogIn size={16} /> Entrar na conta</button>
          {tenant.status !== 'SUSPENDED' ? (
            <button type="button" className={s.btnDanger} onClick={() => updateStatus('SUSPENDED')}><Pause size={16} /> Suspender</button>
          ) : (
            <button type="button" className={s.btnSecondary} onClick={() => updateStatus('ACTIVE')}><Play size={16} /> Ativar</button>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className={s.card}>
          <div className={s.cardHeader}><h2 className={s.cardTitle}>Informações</h2></div>
          <div className={s.cardBody}>
            <p style={{ marginBottom: 8 }}><strong>Status:</strong> {TENANT_STATUS[tenant.status]}</p>
            <p style={{ marginBottom: 8 }}><strong>Assinatura:</strong> {SUB_STATUS[tenant.subscription?.status]}</p>
            <p style={{ marginBottom: 8 }}><strong>Vencimento:</strong> {tenant.subscription?.endsAt ? formatDateShort(tenant.subscription.endsAt) : '—'}</p>
            <p style={{ marginBottom: 8 }}><strong>Usuários:</strong> {tenant._count?.users}</p>
            <p style={{ marginBottom: 8 }}><strong>Agendamentos:</strong> {tenant._count?.appointments}</p>
            <p style={{ marginBottom: 16 }}><strong>Clientes:</strong> {tenant._count?.clients}</p>
            <label className={s.label}>Alterar plano</label>
            <select className={s.select} value={tenant.planId || ''} onChange={(e) => updatePlan(e.target.value)}>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className={s.card}>
          <div className={s.cardHeader}><h2 className={s.cardTitle}>Módulos liberados</h2></div>
          <div className={s.cardBody}>
            {features.map((f, i) => (
              <label key={f.module} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <input type="checkbox" checked={f.enabled} onChange={(e) => setFeatures((prev) => prev.map((x, j) => j === i ? { ...x, enabled: e.target.checked } : x))} />
                {f.label}
              </label>
            ))}
            <button type="button" className={s.btnPrimary} onClick={saveFeatures} style={{ marginTop: 12 }}>Salvar permissões</button>
          </div>
        </div>
      </div>
    </>
  );
}
