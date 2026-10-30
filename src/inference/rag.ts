/**
 * Sovereign RAG (Retrieval-Augmented Generation) — in-memory, deterministic,
 * no external services. Uses TF-IDF-like cosine similarity over token bags.
 */
export interface RagDocument {
  id: string;
  text: string;
  vector: Map<string, number>;
}

export interface RagHit {
  id: string;
  text: string;
  score: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/[\p{L}\p{N}]{3,}/gu) ?? [];
}

function buildVector(text: string, idf: Map<string, number>): Map<string, number> {
  const tokens = tokenize(text);
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  const vec = new Map<string, number>();
  for (const [t, f] of tf) {
    const weight = (f / tokens.length) * (idf.get(t) ?? 1);
    vec.set(t, weight);
  }
  return vec;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, v] of a) {
    na += v * v;
    const bv = b.get(k);
    if (bv !== undefined) dot += v * bv;
  }
  for (const v of b.values()) nb += v * v;
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export class SovereignRagStore {
  private docs: RagDocument[] = [];

  add(id: string, text: string): void {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new TypeError('RAG: document id must be a non-empty string');
    }
    if (typeof text !== 'string' || text.trim() === '') {
      throw new TypeError('RAG: document text must be a non-empty string');
    }
    if (this.docs.some((document) => document.id === id)) return;

    // Recompute the vocabulary weights atomically so every document uses the same IDF.
    const documents = [...this.docs.map(({ id: docId, text: docText }) => ({ id: docId, text: docText })), { id, text }];
    const idf = this.computeIdf(documents.map((document) => document.text));
    this.docs = documents.map((document) => ({
      ...document,
      vector: buildVector(document.text, idf),
    }));
  }

  private computeIdf(texts: string[]): Map<string, number> {
    const df = new Map<string, number>();
    const n = texts.length || 1;
    for (const t of texts) {
      const unique = new Set(tokenize(t));
      for (const tok of unique) df.set(tok, (df.get(tok) ?? 0) + 1);
    }
    const idf = new Map<string, number>();
    for (const [tok, d] of df) {
      idf.set(tok, Math.log((n + 1) / (d + 1)) + 1);
    }
    return idf;
  }


  search(query: string, k = 3): RagHit[] {
    if (typeof query !== 'string') throw new TypeError('RAG: query must be a string');
    if (!Number.isInteger(k) || k < 0) throw new RangeError('RAG: k must be a non-negative integer');
    if (this.docs.length === 0 || k === 0 || tokenize(query).length === 0) return [];

    const idf = this.computeIdf(this.docs.map((document) => document.text));
    const qvec = buildVector(query, idf);
    return this.docs
      .map((document) => ({ id: document.id, text: document.text, score: cosine(qvec, document.vector) }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, k);
  }

  size(): number {
    return this.docs.length;
  }
}

export const sovereignRag = new SovereignRagStore();

// Seed knowledge
sovereignRag.add(
  'isabella-identity',
  'Isabella Villaseñor AI es un runtime de inteligencia artificial gobernada, anclado en Real del Monte, Hidalgo, México. Invariante: CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE ≠ LEARNING ≠ PRODUCTION.'
);
sovereignRag.add(
  'governance',
  'Gobernanza CROWN, AEGIS Triple Blockade, BookPI hash-chain SHA-3, IKES memoria epistémica E0-E6, Veritas verificador de evidencia.'
);
sovereignRag.add(
  'territory',
  'Real del Monte (Mineral del Monte), Hidalgo, México, 2660 msnm. Panteón Inglés (1851), Mina de Acosta (1727), Mina La Dificultad (1865), Museo del Paste (2012).'
);