'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { getCurrentUser, updateProfile } from '@/services/authService';
import { useToast } from '@/context/ToastContext';
import styles from '@/styles/admin.module.css';

export default function PerfilPage() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u);
        setName(u?.name || '');
      })
      .finally(() => setLoading(false));
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
      const updated = await updateProfile(payload);
      setUser(updated);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Perfil atualizado com sucesso');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Perfil</h1>
      <p className={styles.pageSubtitle}>Gerencie suas informações de acesso</p>

      <div className={styles.panel} style={{ maxWidth: 520, padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>E-mail</label>
            <input
              type="email"
              className={styles.formInput}
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nome</label>
            <input
              type="text"
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid var(--gray-100)' }} />

          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: 20 }}>
            Alterar senha (deixe em branco para manter a atual)
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Senha atual</label>
            <input
              type="password"
              className={styles.formInput}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nova senha</label>
            <input
              type="password"
              className={styles.formInput}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <Save size={20} />
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
