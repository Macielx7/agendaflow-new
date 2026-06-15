'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import SuperAdminSidebar from '@/components/superadmin/SuperAdminSidebar';
import { ToastProvider } from '@/context/ToastContext';
import { superApi } from '@/services/superadminApi';
import s from '@/styles/superadmin.module.css';

export default function SuperAdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    superApi.me().then((d) => setAdmin(d.admin)).catch(() => {});
  }, []);

  return (
    <ToastProvider>
      <div className={s.layout}>
        <div className={`${s.overlay} ${open ? s.overlayVisible : ''}`} onClick={() => setOpen(false)} />
        <SuperAdminSidebar open={open} onClose={() => setOpen(false)} />
        <div className={s.main}>
          <header className={s.topbar}>
            <button type="button" className={s.menuToggle} onClick={() => setOpen(true)}><Menu size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ThemeToggle />
              <span style={{ fontSize: '0.875rem', color: 'var(--sa-text-muted)' }}>{admin?.name || 'Super Admin'}</span>
            </div>
          </header>
          <div className={s.content}>{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
