'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import s from '@/styles/saas.module.css';

export default function SettingsForm({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form.map((x) => ({ key: x.key, value: x.value, label: x.label })));
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => {
    setForm((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  return (
    <form onSubmit={handleSubmit}>
      {form.map((setting) => (
        <div key={setting.key} className={s.formGroup}>
          <label className={s.label}>{setting.label || setting.key}</label>
          {setting.value?.length > 80 ? (
            <textarea className={s.input} rows={3} value={setting.value} onChange={(e) => update(setting.key, e.target.value)} />
          ) : (
            <input className={s.input} value={setting.value} onChange={(e) => update(setting.key, e.target.value)} />
          )}
        </div>
      ))}
      <button type="submit" className={s.btnPrimary} disabled={loading}>
        {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={18} /> Salvar</>}
      </button>
    </form>
  );
}
