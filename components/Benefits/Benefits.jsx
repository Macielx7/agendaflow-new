'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  Cpu,
  Gem,
  Zap,
  Clock,
  Crown,
} from 'lucide-react';
import { BENEFITS } from '@/utils/constants';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeInUp } from '@/animations/variants';
import styles from './Benefits.module.css';

const iconMap = {
  heart: Heart,
  cpu: Cpu,
  gem: Gem,
  zap: Zap,
  clock: Clock,
  crown: Crown,
};

export default function Benefits() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section className={styles.section} ref={ref}>
      <motion.div
        className={styles.bgOrb}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className="container"
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.div className={styles.header} variants={fadeInUp}>
          <span className="section-label">Por Que Nos Escolher</span>
          <h2 className="section-title">
            A experiência que seu sorriso{' '}
            <span className="gradient-text">merece</span>
          </h2>
          <p className="section-subtitle">
            Mais do que tratamentos — uma jornada de cuidado, tecnologia e
            resultados que elevam sua confiança a outro patamar.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {BENEFITS.map((benefit, index) => {
            const Icon = iconMap[benefit.icon];
            return (
              <motion.article
                key={benefit.title}
                className={styles.card}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className={styles.cardGlass}>
                  <motion.div
                    className={styles.icon}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon size={26} strokeWidth={1.5} />
                  </motion.div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                  <div className={styles.shine} />
                </div>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
