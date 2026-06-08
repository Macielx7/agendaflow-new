import { addMinutes, isBefore, startOfDay, getDay } from 'date-fns';
import prisma from './prisma';
import {
  parseTime,
  formatTime,
  generateTimeSlots,
  isSlotOccupied,
} from './scheduleEngine';

export { parseTime, formatTime, generateTimeSlots } from './scheduleEngine';

export async function getAvailableSlots(dateString, tenantId, serviceDuration = 60, excludeAppointmentId = null) {
  const date = new Date(dateString + 'T12:00:00');
  const dayOfWeek = getDay(date);
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(date);

  if (isBefore(selectedDay, today)) {
    return { slots: [], allSlots: [], bookedTimes: [], message: 'Data passada' };
  }

  const holiday = await prisma.holiday.findFirst({
    where: { tenantId, date: selectedDay, active: true },
  });
  if (holiday) {
    return { slots: [], allSlots: [], bookedTimes: [], message: holiday.name || 'Feriado' };
  }

  const schedule = await prisma.schedule.findFirst({
    where: { tenantId, dayOfWeek, active: true },
  });

  if (!schedule) {
    return { slots: [], allSlots: [], bookedTimes: [], message: 'Sem atendimento neste dia' };
  }

  const duration = serviceDuration || schedule.slotDuration;
  const allSlots = generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    duration,
    schedule.breakStart,
    schedule.breakEnd,
  );

  const maxSetting = await prisma.setting.findUnique({
    where: { tenantId_key: { tenantId, key: 'max_appointments_per_day' } },
  });
  const maxPerDay = maxSetting ? parseInt(maxSetting.value, 10) : 0;

  const booked = await prisma.appointment.findMany({
    where: {
      tenantId,
      date: selectedDay,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    },
    include: { service: true },
  });

  if (maxPerDay > 0 && booked.length >= maxPerDay) {
    return {
      slots: [],
      allSlots,
      bookedTimes: booked.map((b) => b.time),
      message: 'Limite diário atingido',
    };
  }

  const now = new Date();
  const isToday = selectedDay.getTime() === today.getTime();

  const slots = allSlots.filter((slot) => {
    if (isSlotOccupied(slot, duration, booked, excludeAppointmentId)) return false;
    if (isToday) {
      const [h, m] = slot.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      if (isBefore(slotDate, now)) return false;
    }
    const slotEnd = addMinutes(parseTime(slot), duration);
    const endLimit = parseTime(schedule.endTime);
    if (isBefore(endLimit, slotEnd) && formatTime(slotEnd) !== formatTime(endLimit)) return false;
    return true;
  });

  return {
    slots,
    allSlots,
    bookedTimes: booked.map((b) => b.time),
    message: null,
  };
}
