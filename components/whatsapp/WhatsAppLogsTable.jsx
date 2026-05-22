'use client';

import { useEffect, useState } from 'react';
import { whatsappApi } from '@/services/whatsapp/api';
import s from '@/styles/whatsapp.module.css';

export default function WhatsAppLogsTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    whatsappApi.logs(80).then((d) => setLogs(d.logs || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={s.skeleton} style={{ minHeight: 120 }} />;

  if (!logs.length) {
    return <p style={{ color: 'var(--text-muted)', padding: 24 }}>Nenhum evento registrado ainda.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Evento</th>
            <th>Nível</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.event}</td>
              <td>{log.level}</td>
              <td>{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
