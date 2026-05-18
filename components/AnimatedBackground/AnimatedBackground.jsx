'use client';

import { motion } from 'framer-motion';
import styles from './AnimatedBackground.module.css';

export default function AnimatedBackground({ variant = 'hero' }) {
  return (
    <motion.div
      className={`${styles.wrapper} ${styles[variant]}`}
      aria-hidden="true"
    >
      <div className={styles.gradientMesh} />
      <motion.div
        className={styles.orb1}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={styles.orb2}
        animate={{
          x: [0, -25, 0],
          y: [0, 25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={styles.orb3}
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={styles.grid}
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.span
            key={i}
            className={styles.particle}
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
