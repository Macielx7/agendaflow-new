import { normalizeText, tokenize } from './normalize';

export const INTENTS = {
  AGENDAR: 'AGENDAR',
  REMARCAR: 'REMARCAR',
  CANCELAR: 'CANCELAR',
  VALORES: 'VALORES',
  LOCALIZACAO: 'LOCALIZACAO',
  HORARIOS: 'HORARIOS',
  PROCEDIMENTOS: 'PROCEDIMENTOS',
  PAGAMENTO: 'PAGAMENTO',
  AGENDAMENTO_INFO: 'AGENDAMENTO_INFO',
  SAUDACAO: 'SAUDACAO',
  HUMANO: 'HUMANO',
  DUVIDAS: 'DUVIDAS',
  DESCONHECIDO: 'DESCONHECIDO',
};

const INTENT_PATTERNS = [
  {
    intent: INTENTS.HUMANO,
    patterns: ['atendente', 'humano', 'pessoa', 'falar com alguem', 'transferir', 'operador', 'recepcionista'],
    weight: 1,
  },
  {
    intent: INTENTS.CANCELAR,
    patterns: ['cancelar', 'cancela', 'desmarcar', 'nao vou', 'nao poderei', 'desistir'],
    weight: 0.9,
  },
  {
    intent: INTENTS.REMARCAR,
    patterns: ['remarcar', 'reagendar', 'mudar horario', 'trocar data', 'outro dia', 'outro horario'],
    weight: 0.9,
  },
  {
    intent: INTENTS.AGENDAR,
    patterns: ['agendar', 'marcar', 'consulta', 'horario disponivel', 'quero marcar', 'fazer agendamento'],
    weight: 0.85,
  },
  {
    intent: INTENTS.AGENDAMENTO_INFO,
    patterns: ['meu horario', 'minha consulta', 'tenho consulta', 'que horas', 'qual horario', 'meu agendamento', 'amanha', 'hoje tenho'],
    weight: 0.88,
  },
  {
    intent: INTENTS.LOCALIZACAO,
    patterns: ['endereco', 'onde fica', 'localizacao', 'como chegar', 'mapa', 'fica onde'],
    weight: 0.85,
  },
  {
    intent: INTENTS.HORARIOS,
    patterns: ['horario de funcionamento', 'que horas abre', 'que horas fecha', 'funciona sabado', 'funciona domingo', 'abre que horas', 'trabalha sabado'],
    weight: 0.85,
  },
  {
    intent: INTENTS.VALORES,
    patterns: ['quanto custa', 'valor', 'preco', 'custa quanto', 'quanto fica', 'orcamento'],
    weight: 0.82,
  },
  {
    intent: INTENTS.PAGAMENTO,
    patterns: ['aceita cartao', 'forma de pagamento', 'pix', 'parcela', 'dinheiro', 'credito', 'debito'],
    weight: 0.82,
  },
  {
    intent: INTENTS.PROCEDIMENTOS,
    patterns: ['faz implante', 'implante', 'clareamento', 'lente', 'procedimento', 'tratamento', 'fazem', 'realizam', 'oferecem'],
    weight: 0.8,
  },
  {
    intent: INTENTS.SAUDACAO,
    patterns: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'tudo bem'],
    weight: 0.7,
  },
  {
    intent: INTENTS.DUVIDAS,
    patterns: ['duvida', 'pergunta', 'como funciona', 'pode me ajudar', 'me explica', 'nao entendi'],
    weight: 0.65,
  },
];

export function detectIntent(text, context = {}) {
  const normalized = normalizeText(text);
  if (!normalized) return { intent: INTENTS.DESCONHECIDO, confidence: 0 };

  const tokens = tokenize(normalized);
  const scores = new Map();

  for (const { intent, patterns, weight } of INTENT_PATTERNS) {
    let score = 0;
    for (const pattern of patterns) {
      const p = normalizeText(pattern);
      if (normalized.includes(p)) {
        score = Math.max(score, weight);
      } else {
        const pTokens = tokenize(p);
        const overlap = pTokens.filter((t) => tokens.includes(t)).length / Math.max(pTokens.length, 1);
        if (overlap >= 0.5) score = Math.max(score, weight * overlap);
      }
    }
    if (score > 0) scores.set(intent, score);
  }

  if (context.lastTopic && (normalized.includes('quanto') || normalized.includes('custa') || normalized.includes('valor'))) {
    scores.set(INTENTS.VALORES, Math.max(scores.get(INTENTS.VALORES) || 0, 0.75));
  }

  if (context.lastTopic && (normalized.includes('faz') || normalized.includes('tem') || normalized.includes('trabalha'))) {
    scores.set(INTENTS.PROCEDIMENTOS, Math.max(scores.get(INTENTS.PROCEDIMENTOS) || 0, 0.7));
  }

  if (!scores.size) {
    return { intent: INTENTS.DESCONHECIDO, confidence: 0.1 };
  }

  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [intent, confidence] = sorted[0];
  return { intent, confidence: Math.min(1, confidence) };
}
