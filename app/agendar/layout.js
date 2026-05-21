import { ToastProvider } from '@/context/ToastContext';

export const metadata = {
  title: 'Agendar Consulta | Dr. João Marcos',
  description:
    'Agende sua consulta online com o Dr. João Marcos. Escolha procedimento, data e horário com praticidade e segurança.',
  robots: { index: true, follow: true },
};

export default function AgendarLayout({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
