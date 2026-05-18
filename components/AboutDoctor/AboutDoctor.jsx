'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Award, CheckCircle2 } from 'lucide-react';
import { DOCTOR, STATS } from '@/utils/constants';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { fadeInUp, slideInLeft, slideInRight, staggerContainer } from '@/animations/variants';
import styles from './AboutDoctor.module.css';

function StatItem({ stat, active }) {
  const count = useCountUp(stat.value, 2000, active);

  return (
    <motion.div className={styles.stat} variants={fadeInUp}>
      <span className={styles.statValue}>
        {count}
        {stat.suffix}
      </span>
      <span className={styles.statLabel}>{stat.label}</span>
    </motion.div>
  );
}

export default function AboutDoctor() {
  const [ref, isInView] = useInView({ threshold: 0.15 });

  return (
    <section id="sobre" className={styles.section} ref={ref}>
      <div className={styles.decorLine} />

      <motion.div
        className={`container ${styles.grid}`}
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.div className={styles.visual} variants={slideInLeft}>
          <motion.div
            className={styles.imageContainer}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.imageGlow} />
            <Image
              src={DOCTOR.image}
              alt={DOCTOR.name}
              width={560}
              height={640}
              loading="lazy"
              className={styles.image}
            />
            <motion.div
              className={styles.badge}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Award size={24} />
              <motion.div>
                <strong>Especialista</strong>
                <span>Certificado Internacional</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className={styles.content} variants={slideInRight}>
          <span className="section-label">Sobre o Doutor</span>
          <h2 className="section-title">{DOCTOR.name}</h2>
          <p className={styles.title}>{DOCTOR.title}</p>
          <p className={styles.bio}>{DOCTOR.bio}</p>

          <ul className={styles.credentials}>
            {DOCTOR.credentials.map((cred) => (
              <motion.li
                key={cred}
                variants={fadeInUp}
                whileHover={{ x: 4 }}
              >
                <CheckCircle2 size={18} />
                {cred}
              </motion.li>
            ))}
          </ul>

          <motion.div className={styles.stats} variants={staggerContainer}>
            {STATS.map((stat) => (
              <StatItem key={stat.label} stat={stat} active={isInView} />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
