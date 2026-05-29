import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../../config';
import { db, withTenantContext } from '../../config/database';
import { chunkText, embedChunks, TextChunk } from './rag.embedder';
import { sha256 } from '../../utils/encryption';

const pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY });

export interface ProcessDocumentResult {
  documentId:  string;
  chunksTotal: number;
  vectorIds:   string[];
}

/**
 * Full ingestion pipeline for a document:
 * 1. Parse text from PDF or DOCX
 * 2. Chunk the text
 * 3. Embed chunks via OpenAI
 * 4. Upsert to Pinecone namespace isolated per tenant
 * 5. Store chunk metadata in PostgreSQL
 * 6. Update document index status
 */
export async function processDocument(
  tenantId:   string,
  documentId: string,
  filePath:   string,
  mimeType:   string,
): Promise<ProcessDocumentResult> {
  // Mark as processing
  await db.query(
    `UPDATE documents SET index_status = 'processing', updated_at = NOW()
     WHERE id = $1 AND tenant_id = $2`,
    [documentId, tenantId],
  );

  try {
    const rawText = await extractText(filePath, mimeType);
    if (!rawText || rawText.trim().length < 10) {
      throw new Error('Document produced no extractable text');
    }

    const chunks   = chunkText(rawText);
    const vectors  = await embedChunks(chunks);
    const vectorIds = chunks.map(() => `${tenantId}::${documentId}::${uuidv4()}`);

    // Upsert to Pinecone — one namespace per tenant (hard isolation)
    const index = pinecone.index(config.PINECONE_INDEX_NAME);
    const ns    = index.namespace(tenantId); // <-- tenant isolation

    const UPSERT_BATCH = 100;
    for (let i = 0; i < chunks.length; i += UPSERT_BATCH) {
      const batch = chunks.slice(i, i + UPSERT_BATCH);
      await ns.upsert(
        batch.map((chunk, j) => ({
          id:     vectorIds[i + j]!,
          values: vectors[i + j]!,
          metadata: {
            // NOTE: No PII in Pinecone metadata — only IDs and structural info
            documentId,
            tenantId,
            chunkIndex:  chunk.index,
            pageNumber:  chunk.pageNumber ?? 0,
            charStart:   chunk.charStart,
            charEnd:     chunk.charEnd,
            tokenCount:  chunk.tokenCount,
          },
        })),
      );
    }

    // Persist chunk metadata in PostgreSQL (no raw text — only hashes + IDs)
    await withTenantContext(tenantId, async (client) => {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]!;
        await client.query(
          `INSERT INTO document_chunks
             (tenant_id, document_id, vector_id, chunk_index, page_number,
              char_start, char_end, token_count, content_hash)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (vector_id) DO NOTHING`,
          [
            tenantId,
            documentId,
            vectorIds[i],
            chunk.index,
            chunk.pageNumber,
            chunk.charStart,
            chunk.charEnd,
            chunk.tokenCount,
            sha256(chunk.text),
          ],
        );
      }

      // Update document as indexed
      await client.query(
        `UPDATE documents SET
           is_indexed    = TRUE,
           index_status  = 'indexed',
           chunk_count   = $1,
           vector_ids    = $2,
           updated_at    = NOW()
         WHERE id = $3 AND tenant_id = $4`,
        [chunks.length, vectorIds, documentId, tenantId],
      );
    });

    return { documentId, chunksTotal: chunks.length, vectorIds };

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await db.query(
      `UPDATE documents SET
         index_status = 'failed',
         index_error  = $1,
         updated_at   = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [message, documentId, tenantId],
    );
    throw err;
  }
}

async function extractText(filePath: string, mimeType: string): Promise<string> {
  const buffer = await fs.readFile(filePath);

  if (mimeType === 'application/pdf') {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    path.extname(filePath).toLowerCase() === '.docx'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType === 'text/plain' || mimeType === 'text/html') {
    return buffer.toString('utf8');
  }

  throw new Error(`Unsupported MIME type for text extraction: ${mimeType}`);
}

/**
 * Removes all vectors for a document from Pinecone and clears DB metadata.
 * Used when a document is deleted.
 */
export async function deleteDocumentVectors(
  tenantId:   string,
  documentId: string,
): Promise<void> {
  const { rows } = await db.query<{ vector_id: string }>(
    `SELECT vector_id FROM document_chunks
     WHERE tenant_id = $1 AND document_id = $2`,
    [tenantId, documentId],
  );

  if (rows.length === 0) return;

  const vectorIds = rows.map(r => r.vector_id);
  const index = pinecone.index(config.PINECONE_INDEX_NAME);
  const ns    = index.namespace(tenantId);

  const DELETE_BATCH = 1000;
  for (let i = 0; i < vectorIds.length; i += DELETE_BATCH) {
    await ns.deleteMany(vectorIds.slice(i, i + DELETE_BATCH));
  }

  await db.query(
    `DELETE FROM document_chunks WHERE tenant_id = $1 AND document_id = $2`,
    [tenantId, documentId],
  );
}
