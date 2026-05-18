'use client';

import { motion } from 'framer-motion';
import { useScroll } from '@/hooks/useScroll';
import styles from './ScrollProgress.module.css';

export default function ScrollProgress() {
  const { scrollProgress } = useScroll();

  return (
    <div className={styles.track} aria-hidden="true">
      <motion.div
        className={styles.bar}
        style={{ scaleX: scrollProgress / 100 }}
      />
    </div>
  );
}
