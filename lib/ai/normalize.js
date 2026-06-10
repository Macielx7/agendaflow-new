const STOP_WORDS = new Set([
  'a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'os', 'as', 'dos', 'das',
  'para', 'por', 'com', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'à', 'às', 'que',
  'se', 'me', 'te', 'eu', 'voce', 'voces', 'ele', 'ela', 'isso', 'aqui', 'la',
  'the', 'and', 'or', 'to', 'of', 'in', 'on', 'at', 'is', 'are', 'was', 'were',
]);

export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized
    .split(' ')
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export function extractKeywords(text) {
  const tokens = tokenize(text);
  const unique = [...new Set(tokens)];
  return unique.slice(0, 20);
}

export function stemWord(word) {
  const w = normalizeText(word);
  if (w.length <= 4) return w;
  if (w.endsWith('mente')) return w.slice(0, -5);
  if (w.endsWith('acao') || w.endsWith('icao')) return w.slice(0, -4);
  if (w.endsWith('oes')) return w.slice(0, -3);
  if (w.endsWith('ais') || w.endsWith('eis')) return w.slice(0, -3);
  if (w.endsWith('ar') || w.endsWith('er') || w.endsWith('ir')) return w.slice(0, -2);
  if (w.endsWith('s')) return w.slice(0, -1);
  return w;
}

export function stemTokens(tokens) {
  return tokens.map(stemWord);
}
