'use client';

import s from '@/styles/superadmin.module.css';

export default function SuperSettingsPage() {
  return (
    <>
      <h1 className={s.pageTitle}>Configurações globais</h1>
      <p className={s.pageSubtitle}>Parâmetros da plataforma SaaS</p>
      <div className={s.card} style={{ maxWidth: 560 }}>
        <div className={s.cardBody}>
          <p style={{ color: '#a1a1aa', lineHeight: 1.7 }}>
            Configurações globais da plataforma. Planos e limites são gerenciados em Planos e Assinaturas.
          </p>
          <ul style={{ marginTop: 20, color: '#71717a', lineHeight: 2, fontSize: '0.9rem' }}>
            <li>Trial padrão: 14 dias</li>
            <li>Cookie super admin: super_auth_token</li>
            <li>Isolamento multi-tenant ativo</li>
          </ul>
        </div>
      </div>
    </>
  );
}
