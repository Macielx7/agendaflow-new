'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { WEEKDAYS_FULL } from '@/utils/constants';
import s from '@/styles/saas.module.css';

const DEFAULT_SCHEDULES = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  startTime: i === 0 ? '00:00' : '08:00',
  endTime: i === 0 ? '00:00' : i === 6 ? '12:00' : '18:00',
  slotDuration: 60,
  breakStart: i > 0 && i < 6 ? '12:00' : '',
  breakEnd: i > 0 && i < 6 ? '13:00' : '',
  active: i !== 0,
}));

export default function HorariosPage() {
  const toast = useToast();
  const [schedules, setSchedules] = useState(DEFAULT_SCHEDULES);
  const [holidays, setHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [maxPerDay, setMaxPerDay] = useState('12');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.schedules().then((d) => {
      if (d.schedules?.length) {
        const merged = DEFAULT_SCHEDULES.map((def) => {
          const found = d.schedules.find((s) => s.dayOfWeek === def.dayOfWeek);
          return found ? { ...found, breakStart: found.breakStart || '', breakEnd: found.breakEnd || '' } : def;
        });
        setSchedules(merged);
      }
    });
    api.holidays().then((d) => setHolidays(d.holidays));
    api.settings().then((d) => {
      const m = d.settings.find((x) => x.key === 'max_appointments_per_day');
      if (m) setMaxPerDay(m.value);
    });
  }, []);

  const updateSchedule = (i, field, value) => {
    setSchedules((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSchedules(schedules);
      await api.updateSettings([
        { key: 'max_appointments_per_day', value: maxPerDay, label: 'Máx. agendamentos/dia' },
      ]);
      toast.success('Horários salvos');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addHoliday = async () => {
    if (!holidayDate) return;
    await api.createHoliday({ date: holidayDate, name: holidayName || 'Feriado' });
    setHolidayDate('');
    setHolidayName('');
    const d = await api.holidays();
    setHolidays(d.holidays);
    toast.success('Feriado adicionado');
  };

  const removeHoliday = async (id) => {
    await api.deleteHoliday(id);
    setHolidays((h) => h.filter((x) => x.id !== id));
    toast.success('Feriado removido');
  };

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Horários</h1>
        <p className={s.pageSubtitle}>Disponibilidade, intervalos e feriados</p>
      </div>

      <div className={s.card} style={{ marginBottom: 20 }}>
        <div className={s.cardHeader}><h2 className={s.cardTitle}>Dias de funcionamento</h2></div>
        <div className={s.cardBody}>
          {schedules.map((sched, i) => (
            <div key={sched.dayOfWeek} style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 12, alignItems: 'end', padding: '16px 0',
              borderBottom: i < 6 ? '1px solid var(--border)' : 'none',
            }}>
              <div>
                <label className={s.label}>{WEEKDAYS_FULL[sched.dayOfWeek]}</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input type="checkbox" checked={sched.active} onChange={(e) => updateSchedule(i, 'active', e.target.checked)} />
                  Ativo
                </label>
              </div>
              <div className={s.formGroup} style={{ margin: 0 }}>
                <label className={s.label}>Abertura</label>
                <input type="time" className={s.input} value={sched.startTime} onChange={(e) => updateSchedule(i, 'startTime', e.target.value)} disabled={!sched.active} />
              </div>
              <div className={s.formGroup} style={{ margin: 0 }}>
                <label className={s.label}>Fechamento</label>
                <input type="time" className={s.input} value={sched.endTime} onChange={(e) => updateSchedule(i, 'endTime', e.target.value)} disabled={!sched.active} />
              </div>
              <div className={s.formGroup} style={{ margin: 0 }}>
                <label className={s.label}>Intervalo</label>
                <input type="time" className={s.input} value={sched.breakStart || ''} onChange={(e) => updateSchedule(i, 'breakStart', e.target.value)} disabled={!sched.active} />
              </div>
              <div className={s.formGroup} style={{ margin: 0 }}>
                <label className={s.label}>Até</label>
                <input type="time" className={s.input} value={sched.breakEnd || ''} onChange={(e) => updateSchedule(i, 'breakEnd', e.target.value)} disabled={!sched.active} />
              </div>
              <div className={s.formGroup} style={{ margin: 0 }}>
                <label className={s.label}>Slot (min)</label>
                <input type="number" className={s.input} value={sched.slotDuration} onChange={(e) => updateSchedule(i, 'slotDuration', parseInt(e.target.value, 10))} disabled={!sched.active} />
              </div>
            </div>
          ))}
          <div className={s.formGroup} style={{ maxWidth: 200, marginTop: 20 }}>
            <label className={s.label}>Máx. agendamentos/dia</label>
            <input type="number" className={s.input} value={maxPerDay} onChange={(e) => setMaxPerDay(e.target.value)} />
          </div>
          <button type="button" className={s.btnPrimary} onClick={handleSave} disabled={saving} style={{ marginTop: 20 }}>
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar horários'}
          </button>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}><h2 className={s.cardTitle}>Feriados</h2></div>
        <div className={s.cardBody}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <input type="date" className={s.input} value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} style={{ width: 'auto' }} />
            <input className={s.input} placeholder="Nome do feriado" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
            <button type="button" className={s.btnSecondary} onClick={addHoliday}><Plus size={16} /> Adicionar</button>
          </div>
          {holidays.map((h) => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{h.date?.slice?.(0, 10)} — {h.name || 'Feriado'}</span>
              <button type="button" onClick={() => removeHoliday(h.id)} style={{ color: '#f87171' }}><Trash2 size={16} /></button>
            </div>
          ))}
          {!holidays.length && <p style={{ color: 'var(--text-muted)' }}>Nenhum feriado cadastrado</p>}
        </div>
      </div>
    </>
  );
}
