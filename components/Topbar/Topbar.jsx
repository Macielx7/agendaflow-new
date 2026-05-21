'use client';

import { Menu } from 'lucide-react';
import s from '@/styles/saas.module.css';

export default function Topbar({ title, user, onMenuClick }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';
  return (
    <header className={s.topbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button type="button" className={s.menuToggle} onClick={onMenuClick} aria-label="Menu">
          <Menu size={20} />
        </button>
        <h2 className={s.topbarTitle}>{title}</h2>
      </div>
      <div className={s.topbarUser}>
        <span>{user?.name || 'Admin'}</span>
        <div className={s.avatar}>{initial}</div>
      </div>
    </header>
  );
}
