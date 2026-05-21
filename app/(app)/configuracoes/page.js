'use client';

import { useEffect, useState } from 'react';
import SettingsForm from '@/components/SettingsForm/SettingsForm';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/saas.module.css';

export default function ConfiguracoesPage() {
  const toast = useToast();
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    api.settings().then((d) => setSettings(d.settings));
  }, []);

  const handleSave = async (data) => {
    await api.updateSettings(data);
    toast.success('Configurações salvas');
    const d = await api.settings();
    setSettings(d.settings);
  };

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Configurações</h1>
        <p className={s.pageSubtitle}>Dados da empresa e preferências</p>
      </div>
      <div className={s.card} style={{ maxWidth: 640 }}>
        <div className={s.cardBody}>
          {settings.length ? <SettingsForm settings={settings} onSave={handleSave} /> : <p className={s.empty}>Carregando...</p>}
        </div>
      </div>
    </>
  );
}
