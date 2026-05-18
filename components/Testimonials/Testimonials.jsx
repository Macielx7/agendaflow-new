'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/utils/constants';
import { useInView } from '@/hooks/useInView';
import styles from './Testimonials.module.css';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

export default function Testimonials() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section id="depoimentos" className={styles.section} ref={ref}>
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className={styles.header}>
          <span className="section-label">Depoimentos</span>
          <h2 className="section-title">
            Histórias de quem já{' '}
            <span className="gradient-text">transformou o sorriso</span>
          </h2>
          <p className="section-subtitle">
            Pacientes reais compartilham a experiência de recuperar confiança,
            autoestima e qualidade de vida.
          </p>
        </div>

        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className={styles.swiper}
        >
          {TESTIMONIALS.map((item) => (
            <SwiperSlide key={item.id}>
              <motion.article
                className={styles.card}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Quote className={styles.quoteIcon} size={48} />
                <div className={styles.stars}>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className={styles.text}>&ldquo;{item.text}&rdquo;</p>
                <div className={styles.author}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    loading="lazy"
                    className={styles.avatar}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
              </motion.article>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
}
