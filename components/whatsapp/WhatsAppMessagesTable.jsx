'use client';

import { useEffect, useState } from 'react';
import { whatsappApi } from '@/services/whatsapp/api';
import s from '@/styles/whatsapp.module.css';

const STATUS_STYLE = {
  SENT: { color: '#4ade80' },
  FAILED: { color: '#f87171' },
  PENDING: { color: '#facc15' },
};

export default function WhatsAppMessagesTable() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    whatsappApi.messages({ limit: 40 }).then((d) => setMessages(d.messages || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={s.skeleton} style={{ minHeight: 120 }} />;

  if (!messages.length) {
    return <p style={{ color: 'var(--text-muted)', padding: 24 }}>Nenhuma mensagem enviada ainda.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((m) => (
            <tr key={m.id}>
              <td>
                <div>{m.clientName || '—'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.clientPhone}</div>
              </td>
              <td>{m.type}</td>
              <td style={STATUS_STYLE[m.status] || {}}>{m.status}</td>
              <td>{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
