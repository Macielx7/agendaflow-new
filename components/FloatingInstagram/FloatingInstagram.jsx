'use client';

import { motion } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';
import { CONTACT } from '@/utils/constants';
import styles from './FloatingInstagram.module.css';

export default function FloatingInstagram() {
  return (
    <motion.a
      href={CONTACT.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2.7, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Seguir no Instagram"
    >
      <FaInstagram size={26} />
      <span className={styles.tooltip}>Ver resultados</span>
    </motion.a>
  );
}
