'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useWhatsAppStatus } from '@/hooks/whatsapp/useWhatsAppStatus';
import WhatsAppMetricsCards from '@/components/whatsapp/WhatsAppMetricsCards';
import WhatsAppConnectionCard from '@/components/whatsapp/WhatsAppConnectionCard';
import WhatsAppTemplateEditor from '@/components/whatsapp/WhatsAppTemplateEditor';
import WhatsAppAutomationCard from '@/components/whatsapp/WhatsAppAutomationCard';
import WhatsAppMessagesTable from '@/components/whatsapp/WhatsAppMessagesTable';
import WhatsAppLogsTable from '@/components/whatsapp/WhatsAppLogsTable';
import saas from '@/styles/saas.module.css';
import s from '@/styles/whatsapp.module.css';

const TABS = [
  { id: 'conexao', label: 'Conexão' },
  { id: 'templates', label: 'Templates' },
  { id: 'automacoes', label: 'Automações' },
  { id: 'mensagens', label: 'Mensagens' },
  { id: 'logs', label: 'Logs' },
];

export default function WhatsAppConfigPage() {
  const [tab, setTab] = useState('conexao');
  const { instance, settings, metrics, loading, evolutionConfigured, refresh } = useWhatsAppStatus();

  return (
    <div className={s.page}>
      <div className={saas.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/configuracoes" className={s.btnOutline} style={{ marginTop: 4 }}>
            <ArrowLeft size={16} /> Voltar
          </Link>
          <div>
            <h1 className={saas.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageCircle size={28} style={{ color: '#25d366' }} />
              WhatsApp
            </h1>
            <p className={saas.pageSubtitle}>Evolution API · Mensagens automáticas e lembretes</p>
          </div>
        </div>
      </div>

      <WhatsAppMetricsCards metrics={metrics} loading={loading} />

      <div className={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'conexao' && (
        <WhatsAppConnectionCard
          instance={instance}
          evolutionConfigured={evolutionConfigured}
          onRefresh={refresh}
        />
      )}
      {tab === 'templates' && (
        <div className={s.waCard}>
          <div className={s.waCardHeader}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Templates de mensagens</h3>
          </div>
          <div className={s.waCardBody}>
            <WhatsAppTemplateEditor />
          </div>
        </div>
      )}
      {tab === 'automacoes' && (
        <WhatsAppAutomationCard settings={settings} onSaved={refresh} />
      )}
      {tab === 'mensagens' && (
        <div className={s.waCard}>
          <div className={s.waCardHeader}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Mensagens enviadas</h3>
          </div>
          <div className={s.waCardBody}>
            <WhatsAppMessagesTable />
          </div>
        </div>
      )}
      {tab === 'logs' && (
        <div className={s.waCard}>
          <div className={s.waCardHeader}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Logs do sistema</h3>
          </div>
          <div className={s.waCardBody}>
            <WhatsAppLogsTable />
          </div>
        </div>
      )}
    </div>
  );
}
