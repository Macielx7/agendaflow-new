import { format, parse, addMinutes, isBefore, startOfDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
    if (!isBefore(slotEnd, end) && formatTime(slotEnd) !== formatTime(end)) {
      break;
    }

    const inBreak =
      breakStartTime &&
      breakEndTime &&
      !isBefore(current, breakStartTime) &&
      isBefore(current, breakEndTime);

    if (!inBreak) {
      slots.push(formatTime(current));
    }
    current = addMinutes(current, duration);
  }

  return slots;
}

export async function getAvailableSlots(dateString) {
  const date = new Date(dateString + 'T12:00:00');
  const dayOfWeek = getDay(date);
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(date);

  if (isBefore(selectedDay, today)) {
    return { slots: [], schedule: null, message: 'Data passada não disponível' };
  }

  const schedule = await prisma.schedule.findFirst({
    where: { dayOfWeek, active: true },
  });

  if (!schedule) {
    return {
      slots: [],
      schedule: null,
      message: format(date, "EEEE", { locale: ptBR }) + ' — sem atendimento',
    };
  }

  const allSlots = generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    schedule.slotDuration,
    schedule.breakStart,
    schedule.breakEnd
  );

  const booked = await prisma.appointment.findMany({
    where: {
      date: selectedDay,
      status: { not: 'CANCELLED' },
    },
    select: { time: true },
  });

  const bookedTimes = new Set(booked.map((a) => a.time));

  const now = new Date();
  const isToday = selectedDay.getTime() === today.getTime();

  const available = allSlots.filter((slot) => {
    if (bookedTimes.has(slot)) return false;
    if (isToday) {
      const [h, m] = slot.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      if (isBefore(slotDate, now)) return false;
    }
    return true;
  });

  return {
    slots: available,
    allSlots,
    bookedTimes: [...bookedTimes],
    schedule,
    message: null,
  };
}
