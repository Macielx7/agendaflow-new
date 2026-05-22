'use client';

import { useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { superApi } from '@/services/superadminApi';
import s from '@/styles/superadmin.module.css';

export default function SuperAdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await superApi.login(email, password);
      window.location.href = '/superadmin/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <div style={{ padding: 12, background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 12, marginBottom: 20, fontSize: '0.875rem' }}>{error}</div>}
      <div className={s.formGroup}><label className={s.label}>E-mail</label><input type="email" className={s.input} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div className={s.formGroup}><label className={s.label}>Senha</label><input type="password" className={s.input} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
      <button type="submit" className={s.btnPrimary} style={{ width: '100%', marginTop: 8 }} disabled={loading}>
        {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><LogIn size={18} /> Acessar painel</>}
      </button>
    </form>
  );
}
