'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Unlink, Loader2 } from 'lucide-react';
import { whatsappApi } from '@/services/whatsapp/api';
import { useToast } from '@/context/ToastContext';
import WhatsAppStatus from './WhatsAppStatus';
import WhatsAppQRCode from './WhatsAppQRCode';
import s from '@/styles/whatsapp.module.css';

export default function WhatsAppConnectionCard({ instance, evolutionConfigured, onRefresh }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    try {
      await whatsappApi.connect();
      toast.success('QR Code gerado. Escaneie com seu WhatsApp.');
      onRefresh?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshQr = async () => {
    setLoading(true);
    try {
      await whatsappApi.qrcode();
      onRefresh?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!confirm('Desconectar WhatsApp desta conta?')) return;
    setLoading(true);
    try {
      await whatsappApi.disconnect();
      toast.success('WhatsApp desconectado');
      onRefresh?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = instance?.status === 'CONNECTED';
  const isConnecting = instance?.status === 'CONNECTING';

  return (
    <motion.div className={s.waCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={s.waCardHeader}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 6 }}>Conexão WhatsApp</h3>
          <WhatsAppStatus
            status={instance?.status}
            phoneNumber={instance?.phoneNumber}
            profileName={instance?.profileName}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!isConnected && (
            <button type="button" className={s.btnWa} onClick={connect} disabled={loading || !evolutionConfigured}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={18} />}
              {isConnecting ? 'Gerar novo QR' : 'Conectar'}
            </button>
          )}
          {(isConnected || isConnecting) && (
            <button type="button" className={s.btnOutline} onClick={disconnect} disabled={loading}>
              <Unlink size={16} /> Desconectar
            </button>
          )}
        </div>
      </div>
      <div className={s.waCardBody}>
        {!evolutionConfigured && (
          <div className={s.alert} style={{ marginBottom: 20 }}>
            Configure EVOLUTION_API_URL e EVOLUTION_API_KEY no arquivo .env
          </div>
        )}
        {!isConnected && (
          <WhatsAppQRCode
            qrCode={instance?.qrCode}
            onRefresh={isConnecting ? refreshQr : null}
            loading={loading}
          />
        )}
        {isConnected && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            WhatsApp conectado. Mensagens automáticas e lembretes estão ativos conforme suas configurações.
            {instance?.connectedAt && (
              <span style={{ display: 'block', marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Conectado em: {new Date(instance.connectedAt).toLocaleString('pt-BR')}
              </span>
            )}
          </p>
        )}
      </div>
    </motion.div>
  );
}
