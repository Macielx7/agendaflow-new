import { format, parse, addMinutes, isBefore, startOfDay, getDay } from 'date-fns';

export function parseTime(timeStr) {
  return parse(timeStr, 'HH:mm', new Date());
}

export function formatTime(date) {
  return format(date, 'HH:mm');
}

export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getAppointmentDuration(apt) {
  return apt.duration ?? apt.service?.duration ?? 60;
}

export function getEndTime(startTime, duration) {
  return minutesToTime(timeToMinutes(startTime) + duration);
}

export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function appointmentRange(apt) {
  const start = timeToMinutes(apt.time);
  return { id: apt.id, start, end: start + getAppointmentDuration(apt) };
}

export function isSlotOccupied(time, duration, appointments, excludeId = null) {
  const start = timeToMinutes(time);
  const end = start + duration;
  return appointments.some((apt) => {
    if (excludeId && apt.id === excludeId) return false;
    const range = appointmentRange(apt);
    return rangesOverlap(start, end, range.start, range.end);
  });
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

export function buildTimeline(startTime, endTime, appointments, slotStep = 30) {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const items = [];

  for (let m = startMin; m < endMin; m += slotStep) {
    const time = minutesToTime(m);
    const overlapping = appointments.filter((apt) => {
      const range = appointmentRange(apt);
      return m >= range.start && m < range.end;
    });
    const apt = overlapping.find((a) => a.time === time) || overlapping[0];
    if (apt && apt.time === time) {
      items.push({ type: 'appointment', time, appointmentId: apt.id });
    } else if (!overlapping.length) {
      items.push({ type: 'free', time });
    }
  }

  return items;
}

export function computeFreeSlots(allSlots, appointments, defaultDuration = 60) {
  return allSlots.filter((slot) => !isSlotOccupied(slot, defaultDuration, appointments));
}

export async function reorganizeSubsequentAppointments(prisma, tenantId, dateObj, fromMinutes) {
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      date: dateObj,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
    },
    include: { service: true },
    orderBy: { time: 'asc' },
  });

  if (!appointments.length) return [];

  let cursor = fromMinutes;
  const updates = [];

  for (const apt of appointments) {
    const aptStart = timeToMinutes(apt.time);
    if (aptStart < fromMinutes) {
      cursor = Math.max(cursor, aptStart + getAppointmentDuration(apt));
      continue;
    }
    const newTime = minutesToTime(cursor);
    if (apt.time !== newTime) {
      updates.push({ id: apt.id, newTime });
    }
    cursor += getAppointmentDuration(apt);
  }

  if (!updates.length) return [];

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < updates.length; i++) {
      await tx.appointment.update({
        where: { id: updates[i].id },
        data: { time: minutesToTime(960 + i) },
      });
    }
    for (const u of updates) {
      await tx.appointment.update({
        where: { id: u.id },
        data: { time: u.newTime },
      });
    }
  });

  return updates;
}

export async function getDayScheduleContext(prisma, dateString, tenantId) {
  const date = new Date(dateString + 'T12:00:00');
  const dayOfWeek = getDay(date);
  const selectedDay = startOfDay(date);

  const schedule = await prisma.schedule.findFirst({
    where: { tenantId, dayOfWeek, active: true },
  });

  if (!schedule) {
    return { schedule: null, appointments: [], allSlots: [], message: 'Sem atendimento neste dia' };
  }

  const appointments = await prisma.appointment.findMany({
    where: { tenantId, date: selectedDay },
    include: { client: true, service: true },
    orderBy: { time: 'asc' },
  });

  const activeAppointments = appointments.filter((a) => !['CANCELLED', 'NO_SHOW'].includes(a.status));
  const slotStep = schedule.slotDuration || 30;
  const allSlots = generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    slotStep,
    schedule.breakStart,
    schedule.breakEnd,
  );

  const freeSlots = computeFreeSlots(allSlots, activeAppointments, slotStep);
  const timeline = buildTimeline(schedule.startTime, schedule.endTime, activeAppointments, slotStep);

  return {
    schedule,
    appointments,
    activeAppointments,
    allSlots,
    freeSlots,
    timeline,
    message: null,
  };
}
