'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Send } from 'lucide-react';
import Modal from '@/components/Modal/Modal';
import { whatsappApi } from '@/services/whatsapp/api';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/whatsapp.module.css';

export default function WhatsAppSendTemplateModal({
  isOpen,
  onClose,
  templateType,
  templateLabel,
  templateContent,
}) {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedId('');
      return;
    }

    setLoading(true);
    fetch('/api/clients', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => toast.error('Erro ao carregar clientes'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const selected = clients.find((c) => c.id === selectedId);

  const send = async () => {
    if (!selectedId) {
      toast.error('Selecione um cliente');
      return;
    }
    setSending(true);
    try {
      await whatsappApi.sendTemplate({
        templateType,
        clientId: selectedId,
        content: templateContent,
      });
      toast.success(`Template enviado para ${selected?.name || 'cliente'}`);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enviar: ${templateLabel}`}
      size="md"
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16, lineHeight: 1.5 }}>
        Selecione o cliente que receberá este template. Se houver agendamento recente, os dados de serviço, data e horário serão preenchidos automaticamente. Na confirmação, o cliente responde *confirmar* ou *cancelar* no WhatsApp.
      </p>

      <div className={s.sendSearch}>
        <Search size={16} />
        <input
          type="search"
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={s.skeleton} style={{ minHeight: 160, marginTop: 12 }} />
      ) : (
        <div className={s.clientList}>
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: 16, textAlign: 'center' }}>
              Nenhum cliente encontrado
            </p>
          ) : (
            filtered.map((client) => (
              <button
                key={client.id}
                type="button"
                className={`${s.clientOption} ${selectedId === client.id ? s.clientOptionActive : ''}`}
                onClick={() => setSelectedId(client.id)}
              >
                <div style={{ fontWeight: 500 }}>{client.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.phone}</div>
              </button>
            ))
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
        <button type="button" className={s.btnOutline} onClick={onClose} disabled={sending}>
          Cancelar
        </button>
        <button type="button" className={s.btnWa} onClick={send} disabled={sending || !selectedId}>
          {sending ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={18} />
          )}
          Enviar mensagem
        </button>
      </div>
    </Modal>
  );
}
