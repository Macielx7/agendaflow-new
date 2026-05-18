'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import styles from './ImageCompare.module.css';

export default function ImageCompare({ before, after, label }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  };

  return (
    <div
      className={styles.compare}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      <div className={styles.imageAfter}>
        <Image
          src={after}
          alt={`Depois - ${label}`}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          loading="lazy"
          className={styles.img}
        />
        <span className={styles.labelAfter}>Depois</span>
      </div>

      <div
        className={styles.imageBefore}
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={before}
          alt={`Antes - ${label}`}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          loading="lazy"
          className={styles.img}
        />
        <span className={styles.labelBefore}>Antes</span>
      </div>

      <motion.div
        className={styles.slider}
        style={{ left: `${position}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div
          className={styles.sliderLine}
          animate={{ boxShadow: ['0 0 20px rgba(74,159,212,0.3)', '0 0 40px rgba(201,169,98,0.4)', '0 0 20px rgba(74,159,212,0.3)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className={styles.sliderHandle}>
          <GripVertical size={20} />
        </div>
      </motion.div>

      <p className={styles.compareLabel}>{label}</p>
    </div>
  );
}
