'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import BookingProgress from '@/components/BookingProgress/BookingProgress';
import AppointmentCalendar from '@/components/AppointmentCalendar/AppointmentCalendar';
import BookingTimeSlots from '@/components/BookingTimeSlots/BookingTimeSlots';
import AppointmentForm from '@/components/AppointmentForm/AppointmentForm';
import { fetchProcedures, fetchSlots, createAppointment } from '@/services/appointmentService';
import { PROCEDURE_ICONS, formatDateBR } from '@/utils/booking';
import { useToast } from '@/context/ToastContext';
import styles from '@/styles/booking.module.css';

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function AgendarPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [procedures, setProcedures] = useState([]);
  const [slotsData, setSlotsData] = useState({ slots: [], allSlots: [], bookedTimes: [], message: null });
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [booking, setBooking] = useState({
    procedureId: null,
    procedure: null,
    date: null,
    time: null,
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    notes: '',
  });

  useEffect(() => {
    fetchProcedures()
      .then(setProcedures)
      .catch(() => toast.error('Erro ao carregar procedimentos'));
  }, [toast]);

  const loadSlots = useCallback(async (date) => {
    setSlotsLoading(true);
    try {
      const data = await fetchSlots(date);
      setSlotsData(data);
    } catch {
      toast.error('Erro ao carregar horários');
      setSlotsData({ slots: [], allSlots: [], bookedTimes: [], message: null });
    } finally {
      setSlotsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (booking.date && step >= 3) {
      loadSlots(booking.date);
    }
  }, [booking.date, step, loadSlots]);

  const selectProcedure = (proc) => {
    setBooking((b) => ({ ...b, procedureId: proc.id, procedure: proc }));
  };

  const validateForm = () => {
    const errors = {};
    if (!booking.patientName || booking.patientName.trim().length < 3) {
      errors.patientName = 'Informe seu nome completo';
    }
    const phone = (booking.patientPhone || '').replace(/\D/g, '');
    if (phone.length < 10) errors.patientPhone = 'Informe um WhatsApp válido';
    if (booking.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.patientEmail)) {
      errors.patientEmail = 'E-mail inválido';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !booking.procedureId) {
      toast.warning('Selecione um procedimento');
      return;
    }
    if (step === 2 && !booking.date) {
      toast.warning('Selecione uma data');
      return;
    }
    if (step === 3 && !booking.time) {
      toast.warning('Selecione um horário');
      return;
    }
    if (step === 4 && !validateForm()) return;
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const appointment = await createAppointment({
        procedureId: booking.procedureId,
        date: booking.date,
        time: booking.time,
        patientName: booking.patientName,
        patientPhone: booking.patientPhone,
        patientEmail: booking.patientEmail,
        notes: booking.notes,
      });
      sessionStorage.setItem('lastAppointment', JSON.stringify(appointment));
      router.push('/agendar/confirmacao');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>DJ</span>
            <span>Dr. João Marcos</span>
          </Link>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <BookingProgress currentStep={step} />

        <div className={styles.card}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className={styles.stepTitle}>Qual procedimento deseja?</h1>
                <p className={styles.stepSubtitle}>
                  Escolha o tratamento ideal para sua jornada rumo ao sorriso dos sonhos.
                </p>
                <div className={styles.procedureGrid}>
                  {procedures.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={styles.skeleton} style={{ height: 160 }} />
                      ))
                    : procedures.map((proc) => {
                        const Icon = PROCEDURE_ICONS[proc.icon] || PROCEDURE_ICONS.sparkles;
                        const selected = booking.procedureId === proc.id;
                        return (
                          <button
                            key={proc.id}
                            type="button"
                            className={`${styles.procedureCard} ${selected ? styles.selected : ''}`}
                            onClick={() => selectProcedure(proc)}
                          >
                            <div
                              className={styles.procedureIcon}
                              style={{ background: proc.color || 'var(--blue)' }}
                            >
                              <Icon size={24} />
                            </div>
                            <div className={styles.procedureName}>{proc.name}</div>
                            <div className={styles.procedureDesc}>{proc.description}</div>
                            <div className={styles.procedureDuration}>~{proc.duration} min</div>
                          </button>
                        );
                      })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className={styles.stepTitle}>Quando prefere vir?</h1>
                <p className={styles.stepSubtitle}>
                  Selecione o dia mais conveniente para sua consulta na clínica.
                </p>
                <AppointmentCalendar
                  selectedDate={booking.date}
                  onSelectDate={(date) => setBooking((b) => ({ ...b, date, time: null }))}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className={styles.stepTitle}>Escolha o horário</h1>
                <p className={styles.stepSubtitle}>
                  {booking.date ? formatDateBR(booking.date) : 'Selecione um horário'}
                </p>
                <BookingTimeSlots
                  slots={slotsData.slots}
                  allSlots={slotsData.allSlots}
                  bookedTimes={slotsData.bookedTimes}
                  selectedTime={booking.time}
                  onSelectTime={(time) => setBooking((b) => ({ ...b, time }))}
                  loading={slotsLoading}
                  message={slotsData.message}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className={styles.stepTitle}>Seus dados</h1>
                <p className={styles.stepSubtitle}>
                  Precisamos dessas informações para confirmar seu agendamento com carinho.
                </p>
                <AppointmentForm
                  data={booking}
                  onChange={(data) => setBooking((b) => ({ ...b, ...data }))}
                  errors={formErrors}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className={styles.stepTitle}>Revise seu agendamento</h1>
                <p className={styles.stepSubtitle}>
                  Confira os detalhes antes de finalizar. Estamos ansiosos para recebê-lo.
                </p>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Procedimento</span>
                    <span className={styles.summaryValue}>{booking.procedure?.name}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Data</span>
                    <span className={styles.summaryValue}>{formatDateBR(booking.date)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Horário</span>
                    <span className={styles.summaryValue}>{booking.time}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Nome</span>
                    <span className={styles.summaryValue}>{booking.patientName}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>WhatsApp</span>
                    <span className={styles.summaryValue}>{booking.patientPhone}</span>
                  </div>
                  {booking.patientEmail && (
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>E-mail</span>
                      <span className={styles.summaryValue}>{booking.patientEmail}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.actions}>
            {step > 1 && (
              <button type="button" className={styles.btnBack} onClick={handleBack}>
                <ArrowLeft size={18} />
                Voltar
              </button>
            )}
            {step < 5 ? (
              <button type="button" className={styles.btnNext} onClick={handleNext}>
                Continuar
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnNext}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Confirmar Agendamento
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
