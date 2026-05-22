'use client';

import { useEffect, useState } from 'react';
import { superApi } from '@/services/superadminApi';
import { useToast } from '@/context/ToastContext';
import { SUB_STATUS } from '@/utils/superConstants';
import { formatDateShort } from '@/utils/format';
import s from '@/styles/superadmin.module.css';

export default function SubscriptionsPage() {
  const toast = useToast();
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = () => {
    const params = filter !== 'all' ? { status: filter } : {};
    superApi.subscriptions(params).then((d) => setSubs(d.subscriptions));
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    await superApi.updateSubscription(id, { status });
    toast.success('Assinatura atualizada');
    load();
  };

  return (
    <>
      <h1 className={s.pageTitle}>Assinaturas</h1>
      <p className={s.pageSubtitle}>Trial, ativas, suspensas e canceladas</p>
      <div style={{ marginBottom: 20 }}>
        <select className={s.select} value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">Todas</option>
          {Object.entries(SUB_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className={s.card}>
        <div style={{ overflowX: 'auto' }}>
          <table className={s.table}>
            <thead><tr><th>Empresa</th><th>Plano</th><th>Status</th><th>Vencimento</th><th>Ações</th></tr></thead>
            <tbody>
              {subs.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.tenant?.companyName}</td>
                  <td>{sub.plan?.name}</td>
                  <td><span className={`${s.badge} ${s[`badge${sub.status}`]}`}>{SUB_STATUS[sub.status]}</span></td>
                  <td>{sub.endsAt ? formatDateShort(sub.endsAt) : '—'}</td>
                  <td>
                    <select className={s.select} style={{ width: 'auto', fontSize: '0.8rem' }} value={sub.status} onChange={(e) => updateStatus(sub.id, e.target.value)}>
                      {Object.keys(SUB_STATUS).map((k) => <option key={k} value={k}>{SUB_STATUS[k]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
