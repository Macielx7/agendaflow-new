'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import SettingsForm from '@/components/SettingsForm/SettingsForm';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/saas.module.css';
import wa from '@/styles/whatsapp.module.css';

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
      <Link href="/configuracoes/whatsapp" className={wa.waCard} style={{ display: 'block', textDecoration: 'none', maxWidth: 640, marginBottom: 24 }}>
        <div className={wa.waCardBody} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #25d366, #128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>WhatsApp · Evolution API</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>Conectar, templates e automações de mensagens</div>
          </div>
        </div>
      </Link>
      <div className={s.card} style={{ maxWidth: 640 }}>
        <div className={s.cardBody}>
          {settings.length ? <SettingsForm settings={settings} onSave={handleSave} /> : <p className={s.empty}>Carregando...</p>}
        </div>
      </div>
    </>
  );
}
