'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, Activity, Layers,
  FileText, Percent, Tag, BarChart3, AlertTriangle,
} from 'lucide-react';
import { FINANCE_NAV } from '@/lib/finance/defaults';
import f from '@/styles/finance.module.css';

const ICONS = {
  layout: LayoutDashboard,
  'arrow-down': ArrowDownLeft,
  'arrow-up': ArrowUpRight,
  activity: Activity,
  layers: Layers,
  file: FileText,
  percent: Percent,
  tag: Tag,
  chart: BarChart3,
  alert: AlertTriangle,
};

export default function FinanceSubNav() {
  const pathname = usePathname();
  return (
    <nav className={f.subNav}>
      {FINANCE_NAV.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.href === '/financeiro'
          ? pathname === '/financeiro'
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${f.subNavItem} ${active ? f.subNavActive : ''}`}
          >
            <Icon size={14} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
