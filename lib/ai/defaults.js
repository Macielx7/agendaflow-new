import { normalizeText, extractKeywords } from './normalize';

export const SYSTEM_FAQ_TEMPLATES = [
  {
    question: 'Qual o endereço da clínica?',
    answer: 'Nosso endereço é {endereco}.',
    keywords: ['endereco', 'onde fica', 'localizacao', 'como chegar'],
    category: 'LOCALIZACAO',
  },
  {
    question: 'Qual o horário de funcionamento?',
    answer: 'Funcionamos de segunda a sexta das {hora_inicio} às {hora_fim}. {sabado}',
    keywords: ['horario', 'funcionamento', 'abre', 'fecha', 'sabado'],
    category: 'HORARIOS',
  },
  {
    question: 'Como faço para agendar?',
    answer: 'Para agendar, entre em contato pelo telefone {telefone} ou responda com o serviço desejado e preferência de data/horário.',
    keywords: ['agendar', 'marcar', 'consulta'],
    category: 'AGENDAR',
  },
  {
    question: 'Qual o telefone da clínica?',
    answer: 'Nosso telefone/WhatsApp é {telefone}.',
    keywords: ['telefone', 'whatsapp', 'contato', 'ligar'],
    category: 'CONTATO',
  },
  {
    question: 'Aceita cartão?',
    answer: 'Sim, aceitamos cartão de crédito, débito e PIX.',
    keywords: ['cartao', 'pagamento', 'pix', 'parcela'],
    category: 'PAGAMENTO',
  },
];

export function buildSystemFaqEntries(tenantId, clinicInfo = {}) {
  const {
    endereco = 'consulte nossa recepção',
    telefone = '',
    horaInicio = '08:00',
    horaFim = '18:00',
    sabado = 'Sábado das 08:00 às 12:00.',
  } = clinicInfo;

  return SYSTEM_FAQ_TEMPLATES.map((tpl) => {
    const answer = tpl.answer
      .replace('{endereco}', endereco)
      .replace('{telefone}', telefone || 'nossa recepção')
      .replace('{hora_inicio}', horaInicio)
      .replace('{hora_fim}', horaFim)
      .replace('{sabado}', sabado);

    return {
      tenantId,
      question: tpl.question,
      answer,
      normalizedQuestion: normalizeText(tpl.question),
      keywords: JSON.stringify(tpl.keywords || extractKeywords(tpl.question)),
      isSystem: true,
      isActive: true,
    };
  });
}

export function parseKeywords(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
