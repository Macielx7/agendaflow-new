'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { InputEmail } from '@/components/FormInput';
import ThemeToggleFloating from '@/components/ThemeToggle/ThemeToggleFloating';
import s from '@/styles/saas.module.css';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setIsError(false);
    setResetUrl('');
    try {
      const data = await api.forgotPassword(email);
      setMsg(data.message);
      setIsError(false);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setMsg(err.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.loginPage}>
      <ThemeToggleFloating />
      <div className={s.loginCard}>
        <h1 className={s.loginTitle}>Recuperar senha</h1>
        <p className={s.loginSubtitle}>Informe seu e-mail cadastrado</p>
        <form onSubmit={handleSubmit}>
          <InputEmail label="E-mail" value={email} onChange={setEmail} required />
          {msg && (
            <p style={{
              marginBottom: 16,
              fontSize: '0.875rem',
              color: isError ? '#f87171' : 'var(--text-secondary)',
              padding: isError ? 12 : 0,
              background: isError ? 'rgba(239,68,68,0.1)' : 'transparent',
              borderRadius: isError ? 8 : 0,
            }}>
              {msg}
            </p>
          )}
          {resetUrl && (
            <p style={{ marginBottom: 16, fontSize: '0.8rem', wordBreak: 'break-all' }}>
              <a href={resetUrl} style={{ color: 'var(--accent-hover)' }}>{resetUrl}</a>
            </p>
          )}
          <button type="submit" className={s.btnPrimary} style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/login" style={{ color: 'var(--accent-hover)', fontSize: '0.875rem' }}>Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
