'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { whatsappApi } from '@/services/whatsapp/api';
import { useToast } from '@/context/ToastContext';
import { TEMPLATE_VARIABLES } from '@/lib/whatsapp/defaults';
import s from '@/styles/whatsapp.module.css';

const TYPE_LABELS = {
  CONFIRMATION: 'Confirmação',
  REMINDER: 'Lembrete',
  CANCELLATION: 'Cancelamento',
  RESCHEDULE: 'Reagendamento',
  COMPLETION: 'Finalização',
};

export default function WhatsAppTemplateEditor() {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    whatsappApi
      .templates()
      .then((d) => setTemplates(d.templates || []))
      .finally(() => setLoading(false));
  }, []);

  const updateContent = (type, content) => {
    setTemplates((prev) =>
      prev.map((t) => (t.type === type ? { ...t, content } : t))
    );
  };

  const insertVar = (type, key) => {
    const t = templates.find((x) => x.type === type);
    if (!t) return;
    updateContent(type, `${t.content}${key}`);
  };

  const save = async () => {
    setSaving(true);
    try {
      const d = await whatsappApi.saveTemplates(templates);
      setTemplates(d.templates);
      toast.success('Templates salvos');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={s.skeleton} style={{ minHeight: 200 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className={s.btnWa} onClick={save} disabled={saving}>
          {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
          Salvar templates
        </button>
      </div>
      {templates.map((t) => (
        <div key={t.type} className={s.templateEditor}>
          <label>{TYPE_LABELS[t.type] || t.type}</label>
          <textarea
            className={s.textarea}
            value={t.content}
            onChange={(e) => updateContent(t.type, e.target.value)}
          />
          <div className={s.vars}>
            {TEMPLATE_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                className={s.varChip}
                onClick={() => insertVar(t.type, v.key)}
                title={v.label}
              >
                {v.key}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
