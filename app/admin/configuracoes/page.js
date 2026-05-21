'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { fetchSettings, updateSettings } from '@/services/authService';
import { useToast } from '@/context/ToastContext';
import styles from '@/styles/admin.module.css';

export default function ConfiguracoesPage() {
  const toast = useToast();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => toast.error('Erro ao carregar configurações'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleChange = (key, value) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings.map((s) => ({ key: s.key, value: s.value })));
      toast.success('Configurações salvas');
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
      <h1 className={styles.pageTitle}>Configurações</h1>
      <p className={styles.pageSubtitle}>
        Personalize informações da clínica e mensagens do sistema
      </p>

      <div className={styles.panel} style={{ maxWidth: 640, padding: 32 }}>
        <form onSubmit={handleSubmit}>
          {settings.map((setting) => (
            <div key={setting.key} className={styles.formGroup}>
              <label className={styles.formLabel}>
                {setting.label || setting.key}
              </label>
              {setting.value.length > 80 ? (
                <textarea
                  className={styles.formInput}
                  rows={3}
                  value={setting.value}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  style={{ minHeight: 100, resize: 'vertical' }}
                />
              ) : (
                <input
                  type="text"
                  className={styles.formInput}
                  value={setting.value}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                />
              )}
            </div>
          ))}

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <Save size={20} />
                Salvar Configurações
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
