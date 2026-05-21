'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/services/api';
import s from '@/styles/saas.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login(email, password);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ padding: 12, background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 12, marginBottom: 20, fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      <div className={s.formGroup}>
        <label className={s.label}>E-mail</label>
        <input type="email" className={s.input} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className={s.formGroup}>
        <label className={s.label}>Senha</label>
        <div style={{ position: 'relative' }}>
          <input type={show ? 'text' : 'password'} className={s.input} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
          <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button type="submit" className={s.btnPrimary} style={{ width: '100%', marginTop: 8 }} disabled={loading}>
        {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><LogIn size={18} /> Entrar</>}
      </button>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
        <Link href="/recuperar-senha" style={{ color: 'var(--accent-hover)' }}>Esqueceu a senha?</Link>
      </p>
    </form>
  );
}
