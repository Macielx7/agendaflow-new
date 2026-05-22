'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
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
            <span style={{ fontSize: '0.875rem', color: '#71717a' }}>{admin?.name || 'Super Admin'}</span>
          </header>
          <div className={s.content}>{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
