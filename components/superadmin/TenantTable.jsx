'use client';

import { TENANT_STATUS, SUB_STATUS } from '@/utils/superConstants';
import { formatDateShort } from '@/utils/format';
import s from '@/styles/superadmin.module.css';

export default function TenantTable({ tenants, onAction }) {
  if (!tenants?.length) return <p className={s.empty}>Nenhum cliente</p>;

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Empresa</th><th>Responsável</th><th>Plano</th><th>Assinatura</th><th>Usuários</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.companyName}</strong><div style={{ fontSize: '0.75rem', color: '#71717a' }}>{t.email}</div></td>
                <td>{t.ownerName}</td>
                <td>{t.plan?.name || '—'}</td>
                <td><span className={`${s.badge} ${s[`badge${t.subscription?.status}`]}`}>{SUB_STATUS[t.subscription?.status] || '—'}</span></td>
                <td>{t._count?.users || 0}</td>
                <td><span className={`${s.badge} ${s[`badge${t.status}`]}`}>{TENANT_STATUS[t.status]}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" className={s.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => onAction('view', t)}>Ver</button>
                    <button type="button" className={s.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => onAction('impersonate', t)}>Entrar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.cardList}>
        {tenants.map((t) => (
          <div key={t.id} className={s.mobileCard}>
            <strong>{t.companyName}</strong>
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 4 }}>{t.plan?.name} · {TENANT_STATUS[t.status]}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" className={s.btnSecondary} onClick={() => onAction('view', t)}>Ver</button>
              <button type="button" className={s.btnPrimary} onClick={() => onAction('impersonate', t)}>Entrar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
