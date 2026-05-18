'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BEFORE_AFTER } from '@/utils/constants';
import { useInView } from '@/hooks/useInView';
import { fadeInUp, staggerContainer } from '@/animations/variants';
import ImageCompare from './ImageCompare';
import styles from './BeforeAfter.module.css';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function BeforeAfter() {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const [activeCompare, setActiveCompare] = useState(0);

  return (
    <section id="resultados" className={styles.section} ref={ref}>
      <div className={styles.cinematicBg} />

      <motion.div
        className="container"
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.div className={styles.header} variants={fadeInUp}>
          <span className="section-label">Resultados Reais</span>
          <h2 className="section-title">
            Transformações que{' '}
            <span className="gradient-text">falam por si</span>
          </h2>
          <p className="section-subtitle">
            Cada sorriso conta uma história de confiança recuperada. Veja a
            diferença que a excelência em odontologia estética pode fazer.
          </p>
        </motion.div>

        <motion.div className={styles.compareSection} variants={fadeInUp}>
          <ImageCompare
            before={BEFORE_AFTER[activeCompare].before}
            after={BEFORE_AFTER[activeCompare].after}
            label={BEFORE_AFTER[activeCompare].label}
          />

          <motion.div className={styles.thumbnails}>
            {BEFORE_AFTER.map((item, index) => (
              <motion.button
                key={item.id}
                className={`${styles.thumb} ${activeCompare === index ? styles.thumbActive : ''}`}
                onClick={() => setActiveCompare(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image
                  src={item.after}
                  alt={item.label}
                  width={120}
                  height={80}
                  loading="lazy"
                />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className={styles.sliderWrap} variants={fadeInUp}>
          <Swiper
            modules={[EffectCoverflow, Pagination, Navigation]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 8,
              stretch: 0,
              depth: 120,
              modifier: 2,
              slideShadows: false,
            }}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: `.${styles.navPrev}`,
              nextEl: `.${styles.navNext}`,
            }}
            className={styles.swiper}
          >
            {BEFORE_AFTER.map((item) => (
              <SwiperSlide key={item.id} className={styles.slide}>
                <div className={styles.slideCard}>
                  <motion.div
                    className={styles.slideImages}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      className={styles.beforeBox}
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className={styles.tag}>Antes</span>
                      <Image
                        src={item.before}
                        alt={`Antes - ${item.label}`}
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                    </motion.div>
                    <motion.div
                      className={styles.afterBox}
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className={styles.tagAfter}>Depois</span>
                      <Image
                        src={item.after}
                        alt={`Depois - ${item.label}`}
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                    </motion.div>
                  </motion.div>
                  <p className={styles.slideLabel}>{item.label}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className={styles.navPrev} aria-label="Anterior">
            <ChevronLeft size={24} />
          </button>
          <button className={styles.navNext} aria-label="Próximo">
            <ChevronRight size={24} />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
