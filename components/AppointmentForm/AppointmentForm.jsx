'use client';

import { useState } from 'react';
import { User, Phone, Mail, MessageSquare } from 'lucide-react';
import styles from './AppointmentForm.module.css';

export default function AppointmentForm({ data, onChange, errors = {} }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          <User size={16} />
          Nome completo *
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.patientName ? styles.error : ''}`}
          placeholder="Como devemos chamá-lo?"
          value={data.patientName || ''}
          onChange={(e) => handleChange('patientName', e.target.value)}
        />
        {errors.patientName && <span className={styles.errorMsg}>{errors.patientName}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          <Phone size={16} />
          WhatsApp *
        </label>
        <input
          type="tel"
          className={`${styles.input} ${errors.patientPhone ? styles.error : ''}`}
          placeholder="(61) 99999-9999"
          value={data.patientPhone || ''}
          onChange={(e) => handleChange('patientPhone', e.target.value)}
        />
        {errors.patientPhone && <span className={styles.errorMsg}>{errors.patientPhone}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          <Mail size={16} />
          E-mail
        </label>
        <input
          type="email"
          className={`${styles.input} ${errors.patientEmail ? styles.error : ''}`}
          placeholder="seu@email.com (opcional)"
          value={data.patientEmail || ''}
          onChange={(e) => handleChange('patientEmail', e.target.value)}
        />
        {errors.patientEmail && <span className={styles.errorMsg}>{errors.patientEmail}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          <MessageSquare size={16} />
          Observações
        </label>
        <textarea
          className={styles.textarea}
          placeholder="Conte-nos sobre suas expectativas ou dúvidas..."
          rows={4}
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}
