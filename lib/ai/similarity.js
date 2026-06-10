import { normalizeText, tokenize, stemTokens } from './normalize';

function termFrequency(tokens) {
  const freq = new Map();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  return freq;
}

function cosineSimilarity(a, b) {
  const all = new Set([...a.keys(), ...b.keys()]);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const key of all) {
    const va = a.get(key) || 0;
    const vb = b.get(key) || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function jaccardSimilarity(setA, setB) {
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  if (!union) return 0;
  return intersection / union;
}

function levenshteinRatio(a, b) {
  const s = normalizeText(a);
  const t = normalizeText(b);
  if (!s || !t) return 0;
  if (s === t) return 1;

  const m = s.length;
  const n = t.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  const dist = dp[m][n];
  const maxLen = Math.max(m, n);
  return 1 - dist / maxLen;
}

export function computeSimilarity(query, candidate, extraKeywords = []) {
  const qTokens = stemTokens(tokenize(query));
  const cTokens = stemTokens(tokenize(candidate));
  const keywordTokens = stemTokens(extraKeywords.flatMap((k) => tokenize(k)));

  const allCTokens = [...cTokens, ...keywordTokens];
  const qSet = new Set(qTokens);
  const cSet = new Set(allCTokens);

  const cosine = cosineSimilarity(termFrequency(qTokens), termFrequency(allCTokens));
  const jaccard = jaccardSimilarity(qSet, cSet);
  const levenshtein = levenshteinRatio(query, candidate);

  const keywordBoost = keywordTokens.filter((k) => qSet.has(k)).length * 0.08;
  const containsBoost =
    normalizeText(candidate).includes(normalizeText(query)) ||
    normalizeText(query).includes(normalizeText(candidate))
      ? 0.15
      : 0;

  const score = cosine * 0.4 + jaccard * 0.35 + levenshtein * 0.25 + keywordBoost + containsBoost;
  return Math.min(1, score);
}

export function rankBySimilarity(query, items, { getText, getKeywords } = {}) {
  return items
    .map((item) => {
      const text = getText ? getText(item) : item.question || item.text || '';
      const keywords = getKeywords ? getKeywords(item) : item.keywords || [];
      const score = computeSimilarity(query, text, keywords);
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
