'use client';

import { useEffect, useState } from 'react';
import { superApi } from '@/services/superadminApi';
import { formatDateShort } from '@/utils/format';
import s from '@/styles/superadmin.module.css';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    superApi.logs({ limit: 100 }).then((d) => setLogs(d.logs));
  }, []);

  return (
    <>
      <h1 className={s.pageTitle}>Logs do sistema</h1>
      <p className={s.pageSubtitle}>Auditoria de ações na plataforma</p>
      <div className={s.card}>
        <div style={{ overflowX: 'auto' }}>
          <table className={s.table}>
            <thead><tr><th>Ação</th><th>Empresa</th><th>Admin</th><th>Detalhes</th><th>Data</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td><code style={{ fontSize: '0.8rem', color: '#22d3ee' }}>{log.action}</code></td>
                  <td>{log.tenant?.companyName || '—'}</td>
                  <td>{log.superAdmin?.name || '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.details || '—'}</td>
                  <td>{formatDateShort(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
