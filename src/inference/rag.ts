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
    if (this.docs.some((d) => d.id === id)) return;
    this.rebuild();
    const idf = this.computeIdf([...this.docs.map((d) => d.text), text]);
    // rebuild all vectors with new idf
    const allTexts = [...this.docs.map((d) => d.text), text];
    const newDocs = [...this.docs, { id, text, vector: new Map() }];
    const newIdf = this.computeIdf(allTexts);
    for (const d of newDocs) {
      if (d.id === id) d.vector = buildVector(d.text, newIdf);
      else {
        const existing = this.docs.find((x) => x.id === d.id);
        if (existing) existing.vector = buildVector(existing.text, newIdf);
      }
    }
    this.docs = newDocs.map((d) => ({
      id: d.id,
      text: d.text,
      vector: d.id === id ? d.vector : this.docs.find((x) => x.id === d.id)?.vector ?? d.vector,
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

  private rebuild(): void {
    if (this.docs.length === 0) return;
    const texts = this.docs.map((d) => d.text);
    const idf = this.computeIdf(texts);
    for (const d of this.docs) d.vector = buildVector(d.text, idf);
  }

  search(query: string, k = 3): RagHit[] {
    if (this.docs.length === 0) return [];
    const idf = this.computeIdf(this.docs.map((d) => d.text));
    const qvec = buildVector(query, idf);
    return this.docs
      .map((d) => ({ id: d.id, text: d.text, score: cosine(qvec, d.vector) }))
      .sort((a, b) => b.score - a.score)
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