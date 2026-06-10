'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import AIKnowledgeEditor from '@/components/ai/AIKnowledgeEditor';
import AIMetricsCards from '@/components/ai/AIMetricsCards';
import saas from '@/styles/saas.module.css';
import s from '@/styles/ai.module.css';

export default function IAConfigPage() {
  return (
    <div className={s.page}>
      <div className={saas.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/configuracoes" className={s.btnOutline} style={{ marginTop: 4 }}>
            <ArrowLeft size={16} /> Voltar
          </Link>
          <div>
            <h1 className={saas.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={28} style={{ color: '#8b5cf6' }} />
              IA · Conhecimento
            </h1>
            <p className={saas.pageSubtitle}>Base de conhecimento e métricas do assistente inteligente</p>
          </div>
        </div>
      </div>

      <AIMetricsCards />
      <AIKnowledgeEditor />
    </div>
  );
}
