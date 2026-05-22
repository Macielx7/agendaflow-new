'use client';

import { motion } from 'framer-motion';
import { RefreshCw, Smartphone } from 'lucide-react';
import s from '@/styles/whatsapp.module.css';

export default function WhatsAppQRCode({ qrCode, onRefresh, loading }) {
  if (!qrCode) {
    return (
      <div className={s.qrWrap}>
        <Smartphone size={48} style={{ color: '#4ade80', opacity: 0.5 }} />
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
          Clique em conectar para gerar o QR Code
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={s.qrWrap}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className={s.qrFrame}>
        <img src={qrCode} alt="QR Code WhatsApp" className={s.qrImage} />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
        Abra o WhatsApp → Aparelhos conectados → Conectar aparelho
      </p>
      {onRefresh && (
        <button type="button" className={s.btnOutline} onClick={onRefresh} disabled={loading}>
          <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} />
          Atualizar QR
        </button>
      )}
    </motion.div>
  );
}
