import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../../config';
import { db, withTenantContext } from '../../config/database';
import { embedQuery } from './rag.embedder';
import { sha256 } from '../../utils/encryption';

const openai  = new OpenAI({ apiKey: config.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY });

const TOP_K           = 8;   // max retrieved chunks per query
const MAX_CONTEXT_TOKENS = 6_000;

// ─── Query type definitions ────────────────────────────────────────────────

export type QueryType =
  | 'semantic_search'
  | 'risk_analysis'
  | 'summarize'
  | 'jurisprudence'
  | 'clause_extract';

export interface RagQueryInput {
  tenantId:     string;
  userId:       string;
  caseId?:      string;
  query:        string;
  queryType:    QueryType;
  documentIds?: string[];  // optionally scope to specific docs
  language?:    'es' | 'en';
}

export interface RagSource {
  documentId:  string;
  filename:    string;
  chunkIndex:  number;
  pageNumber:  number;
  score:       number;
  snippet:     string;   // safe preview — truncated, no full chunk
}

export interface RagQueryResult {
  answer:      string;
  sources:     RagSource[];
  queryType:   QueryType;
  tokensUsed:  number;
  durationMs:  number;
}

// ─── System prompts per query type ────────────────────────────────────────

const SYSTEM_PROMPTS: Record<QueryType, string> = {
  semantic_search: `Eres LexOS AI, asistente jurídico especializado.
Responde en español de forma precisa, clara y profesional.
Basa tu respuesta ÚNICAMENTE en los fragmentos de documentos que se te proporcionan.
Si la información no está en los documentos, indícalo explícitamente.
No inventes jurisprudencia, artículos ni referencias que no aparezcan en el contexto.`,

  risk_analysis: `Eres LexOS AI, especialista en análisis de riesgos contractuales y jurídicos.
Identifica TODAS las cláusulas de riesgo, obligaciones onerosas, penalizaciones,
limitaciones de responsabilidad y condiciones ambiguas que aparezcan en los documentos.
Clasifica cada riesgo como ALTO / MEDIO / BAJO.
Proporciona SIEMPRE el número de página o cláusula donde se encuentra cada riesgo.
Basa tu análisis ÚNICAMENTE en los documentos proporcionados.`,

  summarize: `Eres LexOS AI, asistente de síntesis jurídica.
Genera un resumen ejecutivo estructurado con:
1. Partes involucradas
2. Objeto del documento
3. Obligaciones principales de cada parte
4. Plazos y fechas clave
5. Puntos de especial atención
Usa lenguaje jurídico preciso pero comprensible para el cliente.`,

  jurisprudence: `Eres LexOS AI, investigador de jurisprudencia y doctrina legal.
Extrae y sintetiza los criterios jurisprudenciales, fundamentos de derecho,
ratios decidendi y obiter dicta relevantes de los documentos proporcionados.
Indica el órgano judicial, fecha y número de resolución cuando estén disponibles.`,

  clause_extract: `Eres LexOS AI, especialista en extracción de cláusulas contractuales.
Extrae y clasifica las cláusulas del documento por categorías:
OBJETO, PRECIO, PLAZO, GARANTÍAS, RESOLUCIÓN, CONFIDENCIALIDAD, PROPIEDAD INTELECTUAL,
PENALIZACIONES, JURISDICCIÓN y OTRAS.
Presenta cada cláusula con su texto exacto y número de referencia.`,
};

// ─── Main RAG query function ───────────────────────────────────────────────

export async function ragQuery(input: RagQueryInput): Promise<RagQueryResult> {
  const startTime = Date.now();
  const lang = input.language ?? 'es';

  // 1. Embed the user's query
  const queryVector = await embedQuery(input.query);

  // 2. Retrieve semantically similar chunks from Pinecone (tenant-isolated namespace)
  const index = pinecone.index(config.PINECONE_INDEX_NAME);
  const ns    = index.namespace(input.tenantId);  // TENANT ISOLATION

  // Build metadata filter if specific documents requested
  const filter = input.documentIds && input.documentIds.length > 0
    ? { documentId: { $in: input.documentIds } }
    : undefined;

  const queryResponse = await ns.query({
    vector:          queryVector,
    topK:            TOP_K,
    includeMetadata: true,
    filter,
  });

  const matches = queryResponse.matches ?? [];

  if (matches.length === 0) {
    return {
      answer: lang === 'es'
        ? 'No se encontraron documentos relevantes para esta consulta. Asegúrese de haber indexado los documentos necesarios.'
        : 'No relevant documents found for this query.',
      sources:    [],
      queryType:  input.queryType,
      tokensUsed: 0,
      durationMs: Date.now() - startTime,
    };
  }

  // 3. Load original chunk text from document storage (chunks not stored in DB as text)
  const documentIds = [...new Set(matches.map(m => m.metadata?.['documentId'] as string))];

  // Load document filenames for source attribution
  const { rows: docRows } = await db.query<{ id: string; filename_original: string }>(
    `SELECT id, filename_original FROM documents
     WHERE id = ANY($1) AND tenant_id = $2`,
    [documentIds, input.tenantId],
  );
  const docMap = new Map(docRows.map(r => [r.id, r.filename_original]));

  // 4. Reconstruct context from chunk text (retrieved from storage)
  const contextSegments = await retrieveChunkTexts(
    input.tenantId,
    matches,
    docMap,
  );

  // Trim context to token budget
  let contextText = '';
  for (const seg of contextSegments) {
    if (contextText.length / 4 + seg.text.length / 4 > MAX_CONTEXT_TOKENS) break;
    contextText += `\n\n--- Documento: ${seg.filename} | Pág. ${seg.pageNumber} ---\n${seg.text}`;
  }

  // 5. Generate answer with GPT-4
  const systemPrompt = SYSTEM_PROMPTS[input.queryType];
  const userPrompt   = `Consulta: ${input.query}\n\nDocumentos de referencia:\n${contextText}`;

  const completion = await openai.chat.completions.create({
    model:       config.OPENAI_CHAT_MODEL,
    temperature: 0.1,   // low temperature for factual legal work
    max_tokens:  2_000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
  });

  const answer    = completion.choices[0]?.message?.content ?? '';
  const tokensUsed = completion.usage?.total_tokens ?? 0;

  // 6. Build source references (truncated snippets only — never full chunk text in response)
  const sources: RagSource[] = matches.slice(0, 5).map(m => ({
    documentId:  m.metadata?.['documentId'] as string,
    filename:    docMap.get(m.metadata?.['documentId'] as string) ?? 'Unknown',
    chunkIndex:  m.metadata?.['chunkIndex'] as number ?? 0,
    pageNumber:  m.metadata?.['pageNumber'] as number ?? 0,
    score:       m.score ?? 0,
    snippet:     '', // populated below from contextSegments
  }));

  // Add snippets from context
  for (const src of sources) {
    const seg = contextSegments.find(
      s => s.documentId === src.documentId && s.chunkIndex === src.chunkIndex,
    );
    if (seg) {
      src.snippet = seg.text.slice(0, 200) + (seg.text.length > 200 ? '…' : '');
    }
  }

  const durationMs = Date.now() - startTime;

  // 7. Log query for privacy audit (hashed query, never raw text)
  await withTenantContext(input.tenantId, async (client) => {
    await client.query(
      `INSERT INTO rag_queries
         (tenant_id, user_id, case_id, query_hash, query_type, doc_ids_searched,
          chunks_retrieved, model_used, tokens_prompt, tokens_completion, duration_ms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        input.tenantId,
        input.userId,
        input.caseId ?? null,
        sha256(input.query),                            // NEVER store raw query
        input.queryType,
        documentIds,
        matches.length,
        config.OPENAI_CHAT_MODEL,
        completion.usage?.prompt_tokens ?? 0,
        completion.usage?.completion_tokens ?? 0,
        durationMs,
      ],
    );
  });

  return { answer, sources, queryType: input.queryType, tokensUsed, durationMs };
}

// ─── Risk analysis shortcut ────────────────────────────────────────────────

export async function analyzeDocumentRisk(
  tenantId:   string,
  userId:     string,
  documentIds: string[],
  caseId?:   string,
): Promise<RagQueryResult> {
  return ragQuery({
    tenantId,
    userId,
    caseId,
    query: 'Analiza todos los riesgos legales, cláusulas desfavorables, obligaciones onerosas, '
         + 'penalizaciones y condiciones de riesgo presentes en este documento. '
         + 'Clasifica cada riesgo como ALTO, MEDIO o BAJO e indica la ubicación exacta.',
    queryType:   'risk_analysis',
    documentIds,
    language:    'es',
  });
}

// ─── Jurisprudence summarizer ──────────────────────────────────────────────

export async function summarizeJurisprudence(
  tenantId:    string,
  userId:      string,
  documentIds: string[],
  topic:       string,
  caseId?:     string,
): Promise<RagQueryResult> {
  return ragQuery({
    tenantId,
    userId,
    caseId,
    query: `Extrae y sintetiza la jurisprudencia relevante sobre: ${topic}. `
         + 'Incluye los criterios principales, las posiciones doctrinales y cualquier '
         + 'evolución jurisprudencial que se aprecie en los documentos.',
    queryType:   'jurisprudence',
    documentIds,
    language:    'es',
  });
}

// ─── Internal: retrieve chunk texts from storage ──────────────────────────

interface ContextSegment {
  documentId:  string;
  filename:    string;
  chunkIndex:  number;
  pageNumber:  number;
  text:        string;
}

async function retrieveChunkTexts(
  tenantId: string,
  matches:  Array<{ id: string; score?: number; metadata?: Record<string, unknown> }>,
  docMap:   Map<string, string>,
): Promise<ContextSegment[]> {
  // In production this reads the actual text from encrypted object storage
  // using the vector metadata (charStart/charEnd) to slice the original file.
  // For the MVP, we load the full document text and slice by character offsets.

  const results: ContextSegment[] = [];

  // Group matches by document to minimize storage reads
  const byDoc = new Map<string, typeof matches>();
  for (const m of matches) {
    const docId = m.metadata?.['documentId'] as string;
    if (!byDoc.has(docId)) byDoc.set(docId, []);
    byDoc.get(docId)!.push(m);
  }

  for (const [docId, docMatches] of byDoc) {
    const { rows } = await db.query<{ storage_path: string }>(
      `SELECT storage_path FROM documents WHERE id = $1 AND tenant_id = $2`,
      [docId, tenantId],
    );
    if (rows.length === 0) continue;

    // NOTE: In production, decrypt from S3/object storage here
    // For MVP, we read from local encrypted storage path
    const storagePath = rows[0]!.storage_path;
    let fullText = '';
    try {
      const fs = await import('fs/promises');
      const raw = await fs.readFile(storagePath);
      // decrypt using doc-level IV stored in documents table
      // (simplified here — production uses EncryptedStorageService)
      fullText = raw.toString('utf8');
    } catch {
      continue; // skip if file unavailable
    }

    for (const m of docMatches) {
      const charStart = m.metadata?.['charStart'] as number ?? 0;
      const charEnd   = m.metadata?.['charEnd']   as number ?? Math.min(charStart + 1500, fullText.length);
      results.push({
        documentId: docId,
        filename:   docMap.get(docId) ?? 'Unknown',
        chunkIndex: m.metadata?.['chunkIndex'] as number ?? 0,
        pageNumber: m.metadata?.['pageNumber'] as number ?? 0,
        text:       fullText.slice(charStart, charEnd),
      });
    }
  }

  // Sort by relevance score (matches already ranked by Pinecone)
  return results;
}
