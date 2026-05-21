'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, ClipboardList, Users, Settings } from 'lucide-react';
import s from '@/styles/saas.module.css';

const ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/agenda', icon: Calendar, label: 'Agenda' },
  { href: '/agendamentos', icon: ClipboardList, label: 'Agenda+' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/configuracoes', icon: Settings, label: 'Config' },
];

export default function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav className={s.mobileNav}>
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} className={`${s.mobileNavItem} ${active ? s.active : ''}`}>
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
