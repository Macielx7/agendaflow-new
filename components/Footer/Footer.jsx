'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Instagram,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { CONTACT, NAV_LINKS, SITE } from '@/utils/constants';
import { getWhatsAppLink, scrollToSection } from '@/utils/helpers';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <motion.div
        className={styles.topGlow}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <a href="#inicio" className={styles.logo} onClick={(e) => { e.preventDefault(); scrollToSection('#inicio'); }}>
            <span className={styles.logoMark}>DJ</span>
            <span>{SITE.name}</span>
          </a>
          <p className={styles.tagline}>
            Excelência em lentes de contato dental e implantes. Seu sorriso,
            nossa missão.
          </p>
          <motion.div className={styles.social}>
            <motion.a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </motion.a>
            <motion.a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={22} />
            </motion.a>
          </motion.div>
        </div>

        <div className={styles.links}>
          <h4>Links Rápidos</h4>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <motion.div className={styles.contact}>
          <h4>Contato</h4>
          <ul>
            {/* <li>
              <MapPin size={18} />
              <span>{CONTACT.address}</span>
            </li> */}
            <li>
              <Clock size={18} />
              <span>{CONTACT.hours}</span>
            </li>
            <li>
              <Phone size={18} />
              <a href={`tel:${CONTACT.phone.replace(/\D/g, '')}`}>{CONTACT.phone}</a>
            </li>
            {/* <li>
              <Mail size={18} />
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li> */}
          </ul>
        </motion.div>

        <div className={styles.cta}>
          <h4>Agende Agora</h4>
          <p>Transforme seu sorriso com quem entende de excelência.</p>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <FaWhatsapp size={20} />
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>
            © {currentYear} {SITE.name}. Todos os direitos reservados.
          </p>
          <p className={styles.cro}>CRO-DF 12345 · Responsável Técnico: Dr. João Marcos</p>
        </div>
      </div>
    </footer>
  );
}
