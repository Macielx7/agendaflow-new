'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, User, Settings } from 'lucide-react';
import styles from '@/styles/admin.module.css';

const ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Início' },
  { href: '/admin/agendamentos', icon: Calendar, label: 'Agenda' },
  { href: '/admin/perfil', icon: User, label: 'Perfil' },
  { href: '/admin/configuracoes', icon: Settings, label: 'Config' },
];

export default function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.mobileNav}>
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.mobileNavItem} ${active ? styles.active : ''}`}
          >
            <Icon size={22} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
