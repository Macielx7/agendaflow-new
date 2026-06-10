'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parse, isToday, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Bell, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppointmentCard from './AppointmentCard';
import TimeTimeline from './TimeTimeline';
import DurationModal from './DurationModal';
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { api } from '@/services/api';
import { whatsappApi } from '@/services/whatsapp/api';
import { useToast } from '@/context/ToastContext';
import { VALID_STATUSES, STATUS_LABELS } from '@/lib/validations';
import s from '@/styles/saas.module.css';
import styles from './DayAgenda.module.css';

export default function DayAgendaView({ date }) {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dragOverTime, setDragOverTime] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [durationModal, setDurationModal] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sendingConfirmationId, setSendingConfirmationId] = useState(null);

  const dateObj = useMemo(() => parse(date, 'yyyy-MM-dd', new Date()), [date]);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (search) params.search = search;
    api
      .dayAgenda(date, params)
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [date, statusFilter, search, toast]);

  useEffect(() => {
    load();
    api.clients().then((d) => setClients(d.clients));
    api.services().then((d) => setServices(d.services));
  }, [load]);

  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const upcomingAlert = useMemo(() => {
    if (!data?.appointments || !isToday(dateObj)) return null;
    const now = new Date();
    const upcoming = data.appointments.find((a) => {
      if (!['PENDING', 'CONFIRMED'].includes(a.status)) return false;
      const [h, m] = a.time.split(':').map(Number);
      const aptTime = new Date();
      aptTime.setHours(h, m, 0, 0);
      const diff = differenceInMinutes(aptTime, now);
      return diff >= 0 && diff <= 15;
    });
    if (!upcoming) return null;
    return `Próximo atendimento: ${upcoming.client?.name} às ${upcoming.time}`;
  }, [data, dateObj]);

  const handleAction = async (id, action, extra = {}) => {
    setActionLoading(id);
    try {
      await api.appointmentAction(id, { action, ...extra });
      toast.success('Agenda atualizada');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDrop = async (appointmentId, newTime) => {
    setDragOverTime(null);
    setDraggingId(null);
    try {
      await api.appointmentAction(appointmentId, { action: 'move', time: newTime });
      toast.success('Horário atualizado');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveAppointment = async (form) => {
    if (selected) {
      await api.updateAppointment(selected.id, form);
      toast.success('Agendamento atualizado');
    } else {
      await api.createAppointment({ ...form, date });
      toast.success('Agendamento criado');
    }
    load();
  };

  const handleSendConfirmation = async (appointment) => {
    if (!appointment?.client?.phone) {
      toast.error('Cliente sem telefone cadastrado');
      return;
    }
    setSendingConfirmationId(appointment.id);
    try {
      await whatsappApi.sendConfirmation(appointment.id);
      toast.success(`Confirmação enviada para ${appointment.client.name}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingConfirmationId(null);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!confirmDelete) return;
    try {
      await api.cancelAppointment(confirmDelete.id);
      toast.success('Agendamento excluído');
      setConfirmDelete(null);
      setSelected(null);
      setAppointmentModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const appointments = data?.appointments || [];

  return (
    <div className={styles.dayPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button type="button" className={styles.backBtn} onClick={() => router.push('/agenda')}>
            <ArrowLeft size={16} /> Voltar à agenda
          </button>
          <h1 className={styles.dateTitle}>
            {format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h1>
          <p className={styles.dateSubtitle}>Gerenciamento do dia</p>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data?.stats?.total ?? '—'}</span>
            <span className={styles.statLabel}>Clientes</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data?.stats?.freeSlots ?? '—'}</span>
            <span className={styles.statLabel}>Horários livres</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data?.stats?.completed ?? '—'}</span>
            <span className={styles.statLabel}>Finalizados</span>
          </div>
        </div>
      </div>

      {upcomingAlert && (
        <div className={styles.alertBanner}>
          <Bell size={18} />
          {upcomingAlert}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os status</option>
          {VALID_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABELS[st]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={s.btnPrimary}
          onClick={() => {
            setSelected(null);
            setAppointmentModal(true);
          }}
        >
          <Plus size={18} /> Novo agendamento
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando agenda...</div>
      ) : data?.message ? (
        <div className={styles.emptyState}>{data.message}</div>
      ) : (
        <div className={styles.layout}>
          <TimeTimeline
            schedule={data?.schedule}
            appointments={appointments}
            freeSlots={data?.freeSlots}
            dragOverTime={dragOverTime}
            onDragOver={setDragOverTime}
            onDragLeave={() => setDragOverTime(null)}
            onDropSlot={handleDrop}
          />

          <div className={styles.cardsPanel}>
            <AnimatePresence mode="popLayout">
              {appointments.length === 0 ? (
                <div className={styles.emptyState}>
                  Nenhum agendamento neste dia.
                  <br />
                  <button
                    type="button"
                    className={s.btnPrimary}
                    style={{ marginTop: 16 }}
                    onClick={() => setAppointmentModal(true)}
                  >
                    Adicionar agendamento
                  </button>
                </div>
              ) : (
                appointments.map((apt, i) => (
                  <motion.div
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <AppointmentCard
                      appointment={apt}
                      loading={actionLoading === apt.id || draggingId === apt.id}
                      sendingConfirmation={sendingConfirmationId === apt.id}
                      onSendConfirmation={handleSendConfirmation}
                      onPresence={() => handleAction(apt.id, 'presence')}
                      onNoShow={() => handleAction(apt.id, 'no_show')}
                      onEditTime={() => setDurationModal(apt)}
                      onFinish={() => handleAction(apt.id, 'finish')}
                      onEdit={(a) => {
                        setSelected(a);
                        setAppointmentModal(true);
                      }}
                      onDelete={setConfirmDelete}
                      onDragStart={setDraggingId}
                      onDragEnd={() => setDraggingId(null)}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <DurationModal
        isOpen={!!durationModal}
        onClose={() => setDurationModal(null)}
        appointment={durationModal}
        loading={!!actionLoading}
        onSave={async (duration) => {
          await handleAction(durationModal.id, 'resize', { duration });
          setDurationModal(null);
        }}
      />

      <AppointmentModal
        isOpen={appointmentModal}
        onClose={() => {
          setAppointmentModal(false);
          setSelected(null);
        }}
        onSave={handleSaveAppointment}
        onDelete={(apt) => setConfirmDelete(apt)}
        appointment={selected}
        clients={clients}
        services={services}
        defaultDate={date}
        onClientsChange={setClients}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteAppointment}
        title="Excluir agendamento"
        message={`Excluir o agendamento de ${confirmDelete?.client?.name} às ${confirmDelete?.time}?`}
        danger
      />
    </div>
  );
}
