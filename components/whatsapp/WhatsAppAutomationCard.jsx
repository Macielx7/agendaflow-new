'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Clock } from 'lucide-react';
import { whatsappApi } from '@/services/whatsapp/api';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/whatsapp.module.css';

const AUTOMATIONS = [
  { key: 'confirmationsEnabled', label: 'Confirmação de agendamento', desc: 'Ao criar ou confirmar consulta' },
  { key: 'remindersEnabled', label: 'Lembrete automático', desc: 'Horas antes da consulta' },
  { key: 'cancellationsEnabled', label: 'Cancelamento', desc: 'Quando agendamento for cancelado' },
  { key: 'reschedulesEnabled', label: 'Reagendamento', desc: 'Ao alterar data ou horário' },
  { key: 'completionsEnabled', label: 'Finalização', desc: 'Quando consulta for concluída' },
];

export default function WhatsAppAutomationCard({ settings: initial, onSaved }) {
  const toast = useToast();
  const [settings, setSettings] = useState(initial || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) setSettings(initial);
    else whatsappApi.settings().then((d) => setSettings(d.settings || {}));
  }, [initial]);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const d = await whatsappApi.updateSettings(settings);
      setSettings(d.settings);
      toast.success('Automações atualizadas');
      onSaved?.(d.settings);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.waCard}>
      <div className={s.waCardHeader}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Automações</h3>
        <button type="button" className={s.btnWa} onClick={save} disabled={saving}>
          {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
          Salvar
        </button>
      </div>
      <div className={s.waCardBody} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {AUTOMATIONS.map((a) => (
          <div key={a.key} className={s.automationRow}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{a.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.desc}</div>
            </div>
            <button
              type="button"
              className={`${s.switch} ${settings[a.key] ? s.switchOn : ''}`}
              onClick={() => toggle(a.key)}
              aria-pressed={settings[a.key]}
            >
              <span className={s.switchKnob} />
            </button>
          </div>
        ))}
        <div className={s.automationRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={18} style={{ color: '#4ade80' }} />
            <div>
              <div style={{ fontWeight: 500 }}>Antecedência do lembrete</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Horas antes da consulta</div>
            </div>
          </div>
          <input
            type="number"
            min={1}
            max={168}
            value={settings.reminderHoursBefore ?? 24}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, reminderHoursBefore: parseInt(e.target.value, 10) || 24 }))
            }
            style={{
              width: 72,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
