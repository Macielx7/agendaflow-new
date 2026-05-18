'use client';

import { motion } from 'framer-motion';
import { useMousePosition } from '@/hooks/useMousePosition';
import styles from './MouseGlow.module.css';

export default function MouseGlow() {
  const { x, y } = useMousePosition();

  return (
    <motion.div
      className={styles.glow}
      animate={{ x: x - 200, y: y - 200 }}
      transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
      aria-hidden="true"
    />
  );
}
