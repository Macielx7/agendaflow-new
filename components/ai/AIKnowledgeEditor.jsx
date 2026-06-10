'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Pencil, BookOpen } from 'lucide-react';
import { aiApi } from '@/services/ai/api';
import { useToast } from '@/context/ToastContext';
import s from '@/styles/ai.module.css';

const EMPTY = { question: '', answer: '', category: '', keywords: '' };

export default function AIKnowledgeEditor() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    aiApi
      .knowledge()
      .then((d) => setItems(d.items || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    let keywords = '';
    try {
      const parsed = JSON.parse(item.keywords || '[]');
      keywords = Array.isArray(parsed) ? parsed.join(', ') : '';
    } catch {
      keywords = item.keywords || '';
    }
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category || '',
      keywords,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Preencha pergunta e resposta');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || null,
        keywords: form.keywords
          ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : undefined,
      };

      if (editingId) {
        await aiApi.updateKnowledge(editingId, payload);
        toast.success('Conhecimento atualizado');
      } else {
        await aiApi.createKnowledge(payload);
        toast.success('Conhecimento adicionado');
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Excluir este item da base de conhecimento?')) return;
    try {
      await aiApi.deleteKnowledge(id);
      toast.success('Item excluído');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={s.card}>
      <div className={s.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={20} style={{ color: '#8b5cf6' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Base de Conhecimento</h3>
        </div>
        <button type="button" className={s.btnPrimary} onClick={openCreate}>
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <div className={s.cardBody}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.5 }}>
          Cadastre perguntas e respostas. O motor usa similaridade textual para encontrar a melhor resposta,
          mesmo quando o cliente escreve de formas diferentes.
        </p>

        {showForm && (
          <div style={{ marginBottom: 24, padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
            <div className={s.formGroup}>
              <label className={s.label}>Pergunta</label>
              <input
                className={s.input}
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="Ex: Vocês fazem implante?"
              />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Resposta</label>
              <textarea
                className={s.textarea}
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Ex: Sim, realizamos implantes dentários..."
              />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Categoria (opcional)</label>
              <input
                className={s.input}
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Ex: PROCEDIMENTOS"
              />
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Palavras-chave (opcional, separadas por vírgula)</label>
              <input
                className={s.input}
                value={form.keywords}
                onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                placeholder="implante, dente, protese"
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className={s.btnOutline} onClick={() => setShowForm(false)} disabled={saving}>
                Cancelar
              </button>
              <button type="button" className={s.btnPrimary} onClick={save} disabled={saving}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className={s.empty}>Carregando...</div>
        ) : items.length === 0 ? (
          <div className={s.empty}>
            Nenhum item cadastrado. Adicione perguntas frequentes da sua clínica.
          </div>
        ) : (
          <div className={s.knowledgeList}>
            {items.map((item) => (
              <div key={item.id} className={s.knowledgeItem}>
                <div className={s.knowledgeQ}>{item.question}</div>
                <div className={s.knowledgeA}>{item.answer}</div>
                <div className={s.knowledgeMeta}>
                  {item.category && <span className={s.chip}>{item.category}</span>}
                  {!item.isActive && <span className={s.chip}>Inativo</span>}
                  <button type="button" className={s.btnOutline} onClick={() => openEdit(item)}>
                    <Pencil size={14} /> Editar
                  </button>
                  <button type="button" className={`${s.btnOutline} ${s.btnDanger}`} onClick={() => remove(item.id)}>
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
