'use client';

import ThemeToggle from './ThemeToggle';
import styles from './ThemeToggle.module.css';

export default function ThemeToggleFloating() {
  return (
    <div className={styles.floating}>
      <ThemeToggle />
    </div>
  );
}
