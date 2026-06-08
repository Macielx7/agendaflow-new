'use client';

import { useParams } from 'next/navigation';
import DayAgendaView from '@/components/DayAgenda/DayAgendaView';

export default function DayAgendaPage() {
  const { date } = useParams();
  return <DayAgendaView date={date} />;
}
