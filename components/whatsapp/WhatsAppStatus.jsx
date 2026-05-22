'use client';

import s from '@/styles/whatsapp.module.css';

const LABELS = {
  CONNECTED: 'Conectado',
  CONNECTING: 'Conectando',
  DISCONNECTED: 'Desconectado',
  EXPIRED: 'QR expirado',
};

const CLASS = {
  CONNECTED: s.statusConnected,
  CONNECTING: s.statusConnecting,
  DISCONNECTED: s.statusDisconnected,
  EXPIRED: s.statusExpired,
};

export default function WhatsAppStatus({ status, phoneNumber, profileName }) {
  const st = status || 'DISCONNECTED';
  return (
    <span className={`${s.statusBadge} ${CLASS[st] || s.statusDisconnected}`}>
      {(st === 'CONNECTING' || st === 'CONNECTED') && <span className={s.pulse} />}
      {LABELS[st] || st}
      {phoneNumber && st === 'CONNECTED' && (
        <span style={{ opacity: 0.85, marginLeft: 4 }}>· {phoneNumber}</span>
      )}
      {profileName && !phoneNumber && <span style={{ marginLeft: 4 }}>· {profileName}</span>}
    </span>
  );
}
