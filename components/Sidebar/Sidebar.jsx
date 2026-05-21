'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, ClipboardList, Users, Briefcase,
  Clock, Settings, LogOut, User,
} from 'lucide-react';
import { APP_NAME, NAV_ITEMS } from '@/utils/constants';
import { api } from '@/services/api';
import s from '@/styles/saas.module.css';

const ICONS = {
  layout: LayoutDashboard, calendar: Calendar, clipboard: ClipboardList,
  users: Users, briefcase: Briefcase, clock: Clock, settings: Settings,
};

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className={`${s.sidebar} ${open ? s.sidebarOpen : ''}`}>
      <div className={s.sidebarBrand}>
        <h1>{APP_NAME}</h1>
        <span>Gestão Interna</span>
      </div>
      <nav className={s.sidebarNav}>
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className={`${s.navItem} ${active ? s.active : ''}`} onClick={onClose}>
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
        <Link href="/perfil" className={`${s.navItem} ${pathname === '/perfil' ? s.active : ''}`} onClick={onClose}>
          <User size={18} />
          Perfil
        </Link>
      </nav>
      <div className={s.sidebarFooter}>
        <button type="button" className={s.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
