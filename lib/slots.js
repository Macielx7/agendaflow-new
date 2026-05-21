import { format, parse, addMinutes, isBefore, startOfDay, getDay } from 'date-fns';
import prisma from './prisma';

export function parseTime(timeStr) {
  return parse(timeStr, 'HH:mm', new Date());
}

export function formatTime(date) {
  return format(date, 'HH:mm');
}

export function generateTimeSlots(startTime, endTime, duration, breakStart, breakEnd) {
  const slots = [];
  let current = parseTime(startTime);
  const end = parseTime(endTime);
  const breakStartTime = breakStart ? parseTime(breakStart) : null;
  const breakEndTime = breakEnd ? parseTime(breakEnd) : null;

  while (isBefore(current, end)) {
    const slotEnd = addMinutes(current, duration);
    if (!isBefore(slotEnd, end) && formatTime(slotEnd) !== formatTime(end)) break;
    const inBreak =
      breakStartTime &&
      breakEndTime &&
      !isBefore(current, breakStartTime) &&
      isBefore(current, breakEndTime);
    if (!inBreak) slots.push(formatTime(current));
    current = addMinutes(current, duration);
  }
  return slots;
}

export async function getAvailableSlots(dateString, serviceDuration = 60) {
  const date = new Date(dateString + 'T12:00:00');
  const dayOfWeek = getDay(date);
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(date);

  if (isBefore(selectedDay, today)) {
    return { slots: [], allSlots: [], bookedTimes: [], message: 'Data passada' };
  }

  const holiday = await prisma.holiday.findFirst({
    where: { date: selectedDay, active: true },
  });
  if (holiday) {
    return { slots: [], allSlots: [], bookedTimes: [], message: holiday.name || 'Feriado' };
  }

  const schedule = await prisma.schedule.findFirst({
    where: { dayOfWeek, active: true },
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
    schedule.breakEnd
  );

  const maxSetting = await prisma.setting.findUnique({ where: { key: 'max_appointments_per_day' } });
  const maxPerDay = maxSetting ? parseInt(maxSetting.value, 10) : 0;

  const booked = await prisma.appointment.findMany({
    where: { date: selectedDay, status: { not: 'CANCELLED' } },
    select: { time: true },
  });

  if (maxPerDay > 0 && booked.length >= maxPerDay) {
    return { slots: [], allSlots, bookedTimes: booked.map((b) => b.time), message: 'Limite diário atingido' };
  }

  const bookedTimes = new Set(booked.map((b) => b.time));
  const now = new Date();
  const isToday = selectedDay.getTime() === today.getTime();

  const slots = allSlots.filter((slot) => {
    if (bookedTimes.has(slot)) return false;
    if (isToday) {
      const [h, m] = slot.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      if (isBefore(slotDate, now)) return false;
    }
    return true;
  });

  return { slots, allSlots, bookedTimes: [...bookedTimes], message: null };
}
