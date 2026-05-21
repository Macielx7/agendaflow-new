'use client';

import { useEffect, useState } from 'react';
import { addDays, subDays, format } from 'date-fns';
import Calendar from '@/components/Calendar/Calendar';
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/saas.module.css';

export default function AgendaPage() {
  const toast = useToast();
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = () => {
    const from = format(subDays(currentDate, 35), 'yyyy-MM-dd');
    const to = format(addDays(currentDate, 35), 'yyyy-MM-dd');
    api.appointments({ from, to }).then((d) => setAppointments(d.appointments));
  };

  useEffect(() => {
    load();
    api.clients().then((d) => setClients(d.clients));
    api.services().then((d) => setServices(d.services));
  }, [currentDate]);

  const handleSave = async (form) => {
    if (selected) {
      await api.updateAppointment(selected.id, form);
      toast.success('Agendamento atualizado');
    } else {
      await api.createAppointment(form);
      toast.success('Agendamento criado');
    }
    load();
  };

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Agenda</h1>
        <p className={s.pageSubtitle}>Visualize e gerencie sua agenda</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div className={s.tabs}>
          {['day', 'week', 'month'].map((v) => (
            <button key={v} type="button" className={`${s.tab} ${view === v ? s.active : ''}`} onClick={() => setView(v)}>
              {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className={s.btnSecondary} onClick={() => setCurrentDate(subDays(currentDate, view === 'day' ? 1 : view === 'week' ? 7 : 30))}>←</button>
          <button type="button" className={s.btnSecondary} onClick={() => setCurrentDate(new Date())}>Hoje</button>
          <button type="button" className={s.btnSecondary} onClick={() => setCurrentDate(addDays(currentDate, view === 'day' ? 1 : view === 'week' ? 7 : 30))}>→</button>
          <button type="button" className={s.btnPrimary} onClick={() => { setSelected(null); setModal(true); }}>+ Novo</button>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardBody}>
          <Calendar
            view={view}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            appointments={appointments}
            onSelectAppointment={(apt) => { setSelected(apt); setModal(true); }}
            onSelectDay={(day) => { setCurrentDate(day); setView('day'); }}
          />
        </div>
      </div>

      <AppointmentModal
        isOpen={modal}
        onClose={() => { setModal(false); setSelected(null); }}
        onSave={handleSave}
        appointment={selected}
        clients={clients}
        services={services}
      />
    </>
  );
}
