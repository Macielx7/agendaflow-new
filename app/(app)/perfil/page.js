'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/saas.module.css';

export default function PerfilPage() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.profile().then((d) => { setUser(d.user); setName(d.user.name); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name };
      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const d = await api.updateProfile(payload);
      setUser(d.user);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Perfil atualizado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Perfil</h1>
        <p className={s.pageSubtitle}>Suas informações de acesso</p>
      </div>
      <div className={s.card} style={{ maxWidth: 480 }}>
        <div className={s.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={s.formGroup}>
              <label className={s.label}>E-mail</label>
              <input className={s.input} value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Nome</label>
              <input className={s.input} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '28px 0' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>Alterar senha</p>
            <div className={s.formGroup}>
              <label className={s.label}>Senha atual</label>
              <input type="password" className={s.input} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Nova senha</label>
              <input type="password" className={s.input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" className={s.btnPrimary} disabled={saving}>
              {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={18} /> Salvar</>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
