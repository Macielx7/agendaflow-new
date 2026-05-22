'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Layers, CreditCard, DollarSign,
  FileText, Settings, LogOut,
} from 'lucide-react';
import { SUPER_APP_NAME, SUPER_NAV } from '@/utils/superConstants';
import { superApi } from '@/services/superadminApi';
import s from '@/styles/superadmin.module.css';

const ICONS = {
  layout: LayoutDashboard, building: Building2, layers: Layers,
  credit: CreditCard, dollar: DollarSign, file: FileText, settings: Settings,
};

export default function SuperAdminSidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await superApi.logout();
    router.push('/superadmin/login');
    router.refresh();
  };

  return (
    <aside className={`${s.sidebar} ${open ? s.sidebarOpen : ''}`}>
      <div className={s.sidebarBrand}>
        <h1>{SUPER_APP_NAME}</h1>
        <span>Super Administração</span>
      </div>
      <nav className={s.sidebarNav}>
        {SUPER_NAV.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className={`${s.navItem} ${active ? s.active : ''}`} onClick={onClose}>
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button type="button" className={s.navItem} onClick={logout} style={{ width: '100%' }}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
