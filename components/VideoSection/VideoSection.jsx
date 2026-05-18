'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { VIDEOS } from '@/utils/constants';
import { useInView } from '@/hooks/useInView';
import { fadeInUp, staggerContainer } from '@/animations/variants';
import styles from './VideoSection.module.css';

export default function VideoSection() {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section id="videos" className={styles.section} ref={ref}>
      <div className={styles.cinematicOverlay} />

      <motion.div
        className="container"
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.div className={styles.header} variants={fadeInUp}>
          <span className="section-label">Conheça Nossa História</span>
          <h2 className={`section-title ${styles.lightTitle}`}>
            Veja a excelência em{' '}
            <span className={styles.goldAccent}>movimento</span>
          </h2>
          <p className={`section-subtitle ${styles.lightSubtitle}`}>
            Institucional, procedimentos e depoimentos reais — transparência que
            gera confiança antes mesmo da sua primeira consulta.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {VIDEOS.map((video, index) => (
            <motion.article
              key={video.id}
              className={`${styles.card} ${index === 0 ? styles.cardFeatured : ''}`}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveVideo(video)}
            >
              <div className={styles.thumbnail}>
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  loading="lazy"
                  className={styles.thumbImg}
                />
                <div className={styles.thumbOverlay} />
                <motion.button
                  className={styles.playBtn}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Assistir ${video.title}`}
                >
                  <motion.span
                    className={styles.playRing}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Play size={28} fill="currentColor" />
                </motion.button>
              </div>
              <motion.div className={styles.cardContent}>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setActiveVideo(null)}
                aria-label="Fechar vídeo"
              >
                <X size={24} />
              </button>
              <div className={styles.videoWrapper}>
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
