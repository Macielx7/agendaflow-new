'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { InputText, InputEmail, InputWhatsApp } from '@/components/FormInput';
import { onlyDigits } from '@/utils/masks';
import s from '@/styles/saas.module.css';

function normalizeSettings(items) {
  return items.map((item) => ({
    ...item,
    value: item.key === 'company_phone' ? onlyDigits(item.value, 11) : item.value,
  }));
}

function SettingField({ setting, onChange }) {
  const { key, value, label } = setting;

  if (key === 'company_phone') {
    return <InputWhatsApp label={label || 'WhatsApp'} value={value} onChange={onChange} required={false} />;
  }
  if (key === 'company_email') {
    return <InputEmail label={label || 'E-mail'} value={value} onChange={onChange} />;
  }
  if (key === 'company_name') {
    return <InputText label={label || 'Nome da empresa'} value={value} onChange={onChange} required />;
  }
  if (value?.length > 80 || key === 'company_address') {
    return (
      <InputText
        label={label || key}
        value={value}
        onChange={onChange}
        multiline
        rows={3}
        validate={() => null}
      />
    );
  }
  return <InputText label={label || key} value={value} onChange={onChange} validate={() => null} />;
}

export default function SettingsForm({ settings, onSave }) {
  const [form, setForm] = useState(() => normalizeSettings(settings));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(normalizeSettings(settings));
  }, [settings]);

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
    setForm((prev) => prev.map((item) => (item.key === key ? { ...item, value } : item)));
  };

  return (
    <form onSubmit={handleSubmit}>
      {form.map((setting) => (
        <SettingField
          key={setting.key}
          setting={setting}
          onChange={(v) => update(setting.key, v)}
        />
      ))}
      <button type="submit" className={s.btnPrimary} disabled={loading}>
        {loading ? (
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <>
            <Save size={18} /> Salvar
          </>
        )}
      </button>
    </form>
  );
}
