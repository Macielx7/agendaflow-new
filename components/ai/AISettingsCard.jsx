'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Save, Sparkles, BookOpen } from 'lucide-react';
import { aiApi } from '@/services/ai/api';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/ai.module.css';

const OPTIONS = [
  {
    key: 'enabled',
    label: 'Ativar IA',
    desc: 'Todas as mensagens recebidas passam pelo motor inteligente local',
  },
  {
    key: 'autoReplyEnabled',
    label: 'Ativar respostas automáticas',
    desc: 'O bot responde automaticamente sem intervenção manual',
  },
  {
    key: 'allowCancellations',
    label: 'Permitir cancelamentos',
    desc: 'Cliente pode cancelar agendamento via WhatsApp',
  },
  {
    key: 'allowReschedules',
    label: 'Permitir remarcações',
    desc: 'Orienta o cliente sobre remarcação de consultas',
  },
  {
    key: 'transferToHuman',
    label: 'Transferir para humano',
    desc: 'Quando a confiança for baixa ou cliente pedir atendente',
  },
];

function Toggle({ on, onClick, disabled }) {
  return (
    <button
      type="button"
      className={`${s.switch} ${on ? s.switchOn : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
    >
      <span className={s.switchThumb} />
    </button>
  );
}

export default function AISettingsCard({ onSaved }) {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    aiApi
      .settings()
      .then((d) => setSettings(d.settings))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const d = await aiApi.updateSettings(settings);
      setSettings(d.settings);
      toast.success('Configurações de IA salvas');
      onSaved?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={s.empty}>Carregando...</div>;
  if (!settings) return null;

  return (
    <div className={s.card}>
      <div className={s.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={20} style={{ color: '#8b5cf6' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Respostas Inteligentes</h3>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/configuracoes/ia" className={s.btnOutline}>
            <BookOpen size={16} /> Gerenciar conhecimento
          </Link>
          <button type="button" className={s.btnPrimary} onClick={save} disabled={saving}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            Salvar
          </button>
        </div>
      </div>
      <div className={s.cardBody}>
        {OPTIONS.map((opt) => (
          <div key={opt.key} className={s.settingRow}>
            <div className={s.settingInfo}>
              <h4>{opt.label}</h4>
              <p>{opt.desc}</p>
            </div>
            <Toggle on={settings[opt.key]} onClick={() => toggle(opt.key)} disabled={saving} />
          </div>
        ))}
        <div className={s.settingRow}>
          <div className={s.settingInfo}>
            <h4>Limite de confiança</h4>
            <p>Respostas abaixo deste valor podem transferir para humano ({Math.round((settings.confidenceThreshold || 0.45) * 100)}%)</p>
          </div>
          <input
            type="range"
            min="20"
            max="90"
            value={Math.round((settings.confidenceThreshold || 0.45) * 100)}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                confidenceThreshold: Number(e.target.value) / 100,
              }))
            }
            style={{ width: 120 }}
          />
        </div>
      </div>
    </div>
  );
}
