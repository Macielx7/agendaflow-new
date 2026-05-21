'use client';

import { Check } from 'lucide-react';
import styles from '@/styles/booking.module.css';

const STEPS = [
  { id: 1, label: 'Procedimento' },
  { id: 2, label: 'Data' },
  { id: 3, label: 'Horário' },
  { id: 4, label: 'Dados' },
  { id: 5, label: 'Confirmar' },
];

export default function BookingProgress({ currentStep }) {
  return (
    <div className={styles.progress}>
      {STEPS.map((step, index) => (
        <div key={step.id} style={{ display: 'contents' }}>
          <div className={styles.progressStep}>
            <div
              className={`${styles.progressDot} ${
                currentStep === step.id
                  ? styles.active
                  : currentStep > step.id
                    ? styles.done
                    : ''
              }`}
            >
              {currentStep > step.id ? <Check size={18} /> : step.id}
            </div>
            <span
              className={`${styles.progressLabel} ${
                currentStep >= step.id ? styles.active : ''
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`${styles.progressLine} ${
                currentStep > step.id ? styles.done : ''
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
