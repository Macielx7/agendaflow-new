'use client';

import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { CONTACT, BOOKING } from '@/utils/constants';
import { getWhatsAppLink } from '@/utils/helpers';
import { useInView } from '@/hooks/useInView';
import styles from './CTASection.module.css';

export default function CTASection() {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section id="contato" className={styles.section} ref={ref}>
      <motion.div
        className={styles.glowBg}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        className={`container ${styles.inner}`}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className={styles.urgency}>
          <Clock size={16} />
          <span>Vagas limitadas para avaliação gratuita este mês</span>
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          Seu sorriso dos sonhos está a{' '}
          <span className={styles.highlight}>uma mensagem</span> de distância
        </motion.h2>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          Não adie mais a confiança que você merece. Agende agora sua avaliação
          personalizada — sem compromisso, com todo o cuidado premium que só o
          Dr. João oferece.
        </motion.p>

        <motion.div
          className={styles.badges}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.badge}>
            <Users size={18} />
            <span>+12 pacientes agendaram esta semana</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link href={BOOKING.url} className={styles.bookingBtn}>
              Agendar Consulta Online
            </Link>
          </motion.div>
          <motion.a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 60px rgba(37,211,102,0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <FaWhatsapp size={28} />
            Falar no WhatsApp
          </motion.a>
          <motion.a
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramBtn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaInstagram size={24} />
            Ver Antes e Depois no Instagram
          </motion.a>
        </motion.div>

        <motion.p
          className={styles.disclaimer}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          Resposta em até 30 minutos · Atendimento exclusivo e personalizado
        </motion.p>
      </motion.div>
    </section>
  );
}
