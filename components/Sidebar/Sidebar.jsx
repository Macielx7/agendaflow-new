'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';
import styles from '@/styles/admin.module.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/agendamentos', label: 'Agendamentos', icon: Calendar },
  { href: '/admin/perfil', label: 'Perfil', icon: User },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarHidden}`}>
      <div className={styles.sidebarBrand}>
        <h1>Dr. João Marcos</h1>
        <span>Painel Administrativo</span>
      </div>

      <nav className={styles.sidebarNav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              onClick={onClose}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
