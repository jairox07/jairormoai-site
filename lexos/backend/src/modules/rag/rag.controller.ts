import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ragQuery, analyzeDocumentRisk, summarizeJurisprudence } from './rag.service';
import { processDocument } from './rag.processor';
import { db } from '../../config/database';
import { auditLog } from '../audit/audit.service';
import { AppError } from '../../utils/errors';

// ─── Validation schemas ────────────────────────────────────────────────────

const QuerySchema = z.object({
  query:       z.string().min(5).max(2_000),
  queryType:   z.enum(['semantic_search','risk_analysis','summarize','jurisprudence','clause_extract'])
               .default('semantic_search'),
  documentIds: z.array(z.string().uuid()).max(20).optional(),
  caseId:      z.string().uuid().optional(),
  language:    z.enum(['es','en']).default('es'),
});

const RiskSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1).max(10),
  caseId:      z.string().uuid().optional(),
});

const JurisprudenceSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1).max(10),
  topic:       z.string().min(5).max(500),
  caseId:      z.string().uuid().optional(),
});

// ─── Controllers ──────────────────────────────────────────────────────────

export async function queryDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = QuerySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: 'Validation failed', details: parsed.error.format() });
      return;
    }

    const { query, queryType, documentIds, caseId, language } = parsed.data;
    const user = req.user!;

    // Verify requested documents belong to this tenant
    if (documentIds && documentIds.length > 0) {
      const { rows } = await db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM documents
         WHERE id = ANY($1) AND tenant_id = $2`,
        [documentIds, user.tenantId],
      );
      if (parseInt(rows[0]!.count) !== documentIds.length) {
        throw new AppError('One or more documents not found or access denied', 403, 'DOC_ACCESS_DENIED');
      }
    }

    const result = await ragQuery({
      tenantId:    user.tenantId,
      userId:      user.id,
      query,
      queryType,
      documentIds,
      caseId,
      language,
    });

    await auditLog({
      tenantId:     user.tenantId,
      userId:       user.id,
      action:       `rag.${queryType}`,
      resourceType: 'rag_query',
      outcome:      'success',
      ipAddress:    req.ip,
      detail:       {
        queryType,
        documentsScoped: documentIds?.length ?? 0,
        tokensUsed:      result.tokensUsed,
        durationMs:      result.durationMs,
      },
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function analyzeRisk(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = RiskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: 'Validation failed', details: parsed.error.format() });
      return;
    }

    const user = req.user!;
    const result = await analyzeDocumentRisk(
      user.tenantId,
      user.id,
      parsed.data.documentIds,
      parsed.data.caseId,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function summarizeJurisprudenceHandler(
  req: Request, res: Response, next: NextFunction
) {
  try {
    const parsed = JurisprudenceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: 'Validation failed', details: parsed.error.format() });
      return;
    }

    const user = req.user!;
    const result = await summarizeJurisprudence(
      user.tenantId,
      user.id,
      parsed.data.documentIds,
      parsed.data.topic,
      parsed.data.caseId,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function indexDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentId } = req.params as { documentId: string };
    const user = req.user!;

    const { rows } = await db.query<{
      id: string; storage_path: string; mime_type: string; index_status: string;
    }>(
      `SELECT id, storage_path, mime_type, index_status
       FROM documents WHERE id = $1 AND tenant_id = $2`,
      [documentId, user.tenantId],
    );

    if (rows.length === 0) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    const doc = rows[0]!;
    if (doc.index_status === 'indexed') {
      res.json({ message: 'Document already indexed', documentId });
      return;
    }
    if (doc.index_status === 'processing') {
      res.json({ message: 'Document is currently being indexed', documentId });
      return;
    }

    // Run indexing asynchronously to avoid request timeout on large documents
    processDocument(user.tenantId, documentId, doc.storage_path, doc.mime_type)
      .then(result => {
        auditLog({
          tenantId:     user.tenantId,
          userId:       user.id,
          action:       'rag.document_indexed',
          resourceType: 'document',
          resourceId:   documentId,
          outcome:      'success',
          detail:       { chunksTotal: result.chunksTotal },
        }).catch(() => {});
      })
      .catch(err => {
        console.error(`Indexing failed for document ${documentId}:`, err.message);
      });

    res.status(202).json({
      message:    'Document indexing started',
      documentId,
      statusUrl:  `/api/documents/${documentId}/index-status`,
    });
  } catch (err) {
    next(err);
  }
}

export async function getIndexStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentId } = req.params as { documentId: string };
    const user = req.user!;

    const { rows } = await db.query<{
      id: string; index_status: string; chunk_count: number | null; index_error: string | null;
    }>(
      `SELECT id, index_status, chunk_count, index_error
       FROM documents WHERE id = $1 AND tenant_id = $2`,
      [documentId, user.tenantId],
    );

    if (rows.length === 0) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}
