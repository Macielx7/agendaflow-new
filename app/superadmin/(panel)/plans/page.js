'use client';

import { useEffect, useState } from 'react';
import { superApi } from '@/services/superadminApi';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/utils/format';
import s from '@/styles/superadmin.module.css';

export default function PlansPage() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    superApi.plans().then((d) => setPlans(d.plans));
  }, []);

  const toggle = async (plan) => {
    await superApi.updatePlan(plan.id, { active: !plan.active });
    toast.success('Plano atualizado');
    superApi.plans().then((d) => setPlans(d.plans));
  };

  return (
    <>
      <h1 className={s.pageTitle}>Planos</h1>
      <p className={s.pageSubtitle}>Básico, Profissional e Premium</p>
      <div className={s.planGrid}>
        {plans.map((p) => (
          <div key={p.id} className={s.planCard} style={{ opacity: p.active ? 1 : 0.5 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{p.name}</h3>
            <p style={{ fontSize: '0.85rem', color: '#71717a', marginTop: 8 }}>{p.description}</p>
            <div className={s.planPrice}>{formatCurrency(p.priceMonthly)}<span style={{ fontSize: '0.8rem', color: '#71717a' }}>/mês</span></div>
            <p style={{ fontSize: '0.8rem', color: '#52525b' }}>Anual: {formatCurrency(p.priceYearly)}</p>
            <ul style={{ marginTop: 16, fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.8 }}>
              <li>Até {p.maxUsers} usuários</li>
              <li>Até {p.maxAppointments} agendamentos/mês</li>
            </ul>
            <button type="button" className={s.btnSecondary} style={{ marginTop: 16, width: '100%' }} onClick={() => toggle(p)}>
              {p.active ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
