'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Sun,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { SPECIALTIES } from '@/utils/constants';
import { getWhatsAppLink } from '@/utils/helpers';
import { staggerContainer, fadeInUp, cardHover } from '@/animations/variants';
import { useInView } from '@/hooks/useInView';
import styles from './Specialties.module.css';

const iconMap = {
  sparkles: Sparkles,
  shield: Shield,
  sun: Sun,
  layers: Layers,
};

export default function Specialties() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section id="especialidades" className={styles.section} ref={ref}>
      <motion.div
        className={styles.bgAccent}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="container"
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.div className={styles.header} variants={fadeInUp}>
          <span className="section-label">Especialidades</span>
          <h2 className="section-title">
            Tratamentos que transformam{' '}
            <span className="gradient-text">vidas</span>
          </h2>
          <p className="section-subtitle">
            Protocolos personalizados com tecnologia de ponta para resultados
            naturais, duradouros e dignos do seu padrão de excelência.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {SPECIALTIES.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <motion.article
                key={item.id}
                className={styles.card}
                variants={fadeInUp}
                initial="rest"
                whileHover="hover"
                custom={index}
              >
                <motion.div variants={cardHover} className={styles.cardInner}>
                  <motion.div
                    className={styles.iconWrap}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={28} strokeWidth={1.5} />
                    <div className={styles.iconGlow} />
                  </motion.div>

                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>

                  <ul className={styles.features}>
                    {item.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>

                  <a
                    href={getWhatsAppLink(
                      `Olá! Tenho interesse em ${item.title}. Gostaria de mais informações.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardLink}
                  >
                    Saiba mais
                    <ArrowUpRight size={18} />
                  </a>

                  <div className={styles.cardBorder} />
                </motion.div>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
