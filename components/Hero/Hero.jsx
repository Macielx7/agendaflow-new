'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaWhatsapp, FaInstagram, FaPlay } from 'react-icons/fa';
import { ChevronDown, Sparkles } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground/AnimatedBackground';
import { CONTACT } from '@/utils/constants';
import { getWhatsAppLink, scrollToSection } from '@/utils/helpers';
import { heroText, floatAnimation } from '@/animations/variants';
import styles from './Hero.module.css';

export default function Hero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section id="inicio" className={styles.hero} ref={sectionRef}>
      <AnimatedBackground variant="hero" />

      <div className={`container ${styles.grid}`}>
        <motion.div className={styles.content} style={{ y: contentY, opacity }}>
          <motion.div
            className={styles.badge}
            custom={0}
            variants={heroText}
            initial="hidden"
            animate="visible"
          >
            <Sparkles size={14} />
            <span>Odontologia Premium · São Paulo</span>
          </motion.div>

          <motion.h1
            className={styles.headline}
            custom={1}
            variants={heroText}
            initial="hidden"
            animate="visible"
          >
            Sorria com{' '}
            <span className="gradient-text">confiança</span> novamente.
          </motion.h1>

          <motion.p
            className={styles.subheadline}
            custom={2}
            variants={heroText}
            initial="hidden"
            animate="visible"
          >
            Transforme seu sorriso com lentes de contato dental e implantes
            premium. Resultados naturais, tecnologia de ponta e atendimento que
            você merece.
          </motion.p>

          <motion.div
            className={styles.ctas}
            custom={3}
            variants={heroText}
            initial="hidden"
            animate="visible"
          >
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <FaWhatsapp size={20} />
              Agendar Avaliação Gratuita
            </a>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-instagram"
            >
              <FaInstagram size={20} />
              Ver Resultados no Instagram
            </a>
          </motion.div>

          <motion.div
            className={styles.trust}
            custom={4}
            variants={heroText}
            initial="hidden"
            animate="visible"
          >
            <motion.div className={styles.trustItem} variants={floatAnimation} animate="animate">
              <strong>3.500+</strong>
              <span>Sorrisos transformados</span>
            </motion.div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <strong>98%</strong>
              <span>Satisfação</span>
            </div>
            <motion.div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <strong>15+</strong>
              <span>Anos de excelência</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className={styles.visual} style={{ y: imageY }}>
          <motion.div
            className={styles.imageFrame}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={styles.glowRing}
              animate={{
                rotate: 360,
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className={styles.imageWrapper}
              variants={floatAnimation}
              animate="animate"
            >
              <Image
                src="/images/imagem_drjoao1.jpeg"
                alt="Dr. João Marcos - Especialista em lentes e implantes dentários"
                width={600}
                height={700}
                priority
                className={styles.doctorImage}
              />
            </motion.div>

            <motion.button
              className={styles.videoBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToSection('#videos')}
            >
              <span className={styles.playIcon}>
                <FaPlay size={14} />
              </span>
              <span>Assista ao vídeo institucional</span>
            </motion.button>
          </motion.div>

          <motion.div
            className={styles.floatingCard}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <span className={styles.cardIcon}>✦</span>
            <motion.div variants={floatAnimation} animate="animate">
              <strong>Design Digital</strong>
              <p>do Sorriso</p>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.floatingCard2}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <strong>★ 5.0</strong>
            <p>+200 avaliações</p>
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        className={styles.scrollIndicator}
        onClick={() => scrollToSection('#especialidades')}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-label="Rolar para especialidades"
      >
        <span>Explore</span>
        <ChevronDown size={20} />
      </motion.button>
    </section>
  );
}
