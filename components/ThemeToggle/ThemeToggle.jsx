'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className || ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
    >
      <span className={`${styles.icon} ${isDark ? styles.iconActive : ''}`}>
        <Sun size={17} />
      </span>
      <span className={`${styles.icon} ${!isDark ? styles.iconActive : ''}`}>
        <Moon size={17} />
      </span>
    </button>
  );
}
