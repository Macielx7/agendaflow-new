'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar/Sidebar';
import Topbar from '@/components/Topbar/Topbar';
import MobileNavigation from '@/components/MobileNavigation/MobileNavigation';
import { ToastProvider } from '@/context/ToastContext';
import { api } from '@/services/api';
import s from '@/styles/saas.module.css';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/agenda': 'Agenda',
  '/agendamentos': 'Agendamentos',
  '/clientes': 'Clientes',
  '/servicos': 'Serviços',
  '/horarios': 'Horários',
  '/configuracoes': 'Configurações',
  '/perfil': 'Perfil',
};

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.me().then((d) => setUser(d.user)).catch(() => {});
  }, []);

  const title = TITLES[pathname] || 'AgendaPro';

  return (
    <ToastProvider>
      <div className={s.layout}>
        <div className={`${s.overlay} ${sidebarOpen ? s.overlayVisible : ''}`} onClick={() => setSidebarOpen(false)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={s.main}>
          <Topbar title={title} user={user} onMenuClick={() => setSidebarOpen(true)} />
          <div className={s.content}>{children}</div>
        </div>
        <MobileNavigation />
      </div>
    </ToastProvider>
  );
}
