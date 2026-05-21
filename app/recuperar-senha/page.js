'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import s from '@/styles/saas.module.css';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.forgotPassword(email);
      setMsg(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.loginPage}>
      <div className={s.loginCard}>
        <h1 className={s.loginTitle}>Recuperar senha</h1>
        <p className={s.loginSubtitle}>Informe seu e-mail cadastrado</p>
        <form onSubmit={handleSubmit}>
          <div className={s.formGroup}>
            <label className={s.label}>E-mail</label>
            <input type="email" className={s.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {msg && <p style={{ marginBottom: 16, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{msg}</p>}
          {resetUrl && (
            <p style={{ marginBottom: 16, fontSize: '0.8rem', wordBreak: 'break-all' }}>
              <a href={resetUrl} style={{ color: 'var(--accent-hover)' }}>{resetUrl}</a>
            </p>
          )}
          <button type="submit" className={s.btnPrimary} style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}><Link href="/login" style={{ color: 'var(--accent-hover)', fontSize: '0.875rem' }}>Voltar ao login</Link></p>
      </div>
    </div>
  );
}
