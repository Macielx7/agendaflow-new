'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import s from '@/styles/saas.module.css';

function Form() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.resetPassword(token, password);
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: '#f87171', marginBottom: 16, fontSize: '0.875rem' }}>{error}</p>}
      <div className={s.formGroup}>
        <label className={s.label}>Nova senha</label>
        <input type="password" className={s.input} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      </div>
      <button type="submit" className={s.btnPrimary} style={{ width: '100%' }} disabled={loading || !token}>
        {loading ? 'Salvando...' : 'Redefinir senha'}
      </button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className={s.loginPage}>
      <div className={s.loginCard}>
        <h1 className={s.loginTitle}>Nova senha</h1>
        <Suspense fallback={<p>Carregando...</p>}><Form /></Suspense>
        <p style={{ textAlign: 'center', marginTop: 20 }}><Link href="/login" style={{ color: 'var(--accent-hover)' }}>Login</Link></p>
      </div>
    </div>
  );
}
