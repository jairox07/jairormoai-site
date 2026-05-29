import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { auditMiddleware } from '../audit/audit.service';
import {
  queryDocuments,
  analyzeRisk,
  summarizeJurisprudenceHandler,
  indexDocument,
  getIndexStatus,
} from './rag.controller';

const router = Router();

// All RAG routes require authentication
router.use(authenticate);

/**
 * POST /api/rag/query
 * Semantic search + AI synthesis over indexed documents.
 * Body: { query, queryType, documentIds?, caseId?, language? }
 */
router.post(
  '/query',
  requireRole('admin', 'lawyer', 'paralegal'),
  auditMiddleware('rag.query', 'rag_query'),
  queryDocuments,
);

/**
 * POST /api/rag/risk
 * Risk analysis shortcut — deep analysis of clauses and obligations.
 * Body: { documentIds, caseId? }
 */
router.post(
  '/risk',
  requireRole('admin', 'lawyer'),
  auditMiddleware('rag.risk_analysis', 'document'),
  analyzeRisk,
);

/**
 * POST /api/rag/jurisprudence
 * Summarize jurisprudence from uploaded case law documents.
 * Body: { documentIds, topic, caseId? }
 */
router.post(
  '/jurisprudence',
  requireRole('admin', 'lawyer', 'paralegal'),
  auditMiddleware('rag.jurisprudence', 'document'),
  summarizeJurisprudenceHandler,
);

/**
 * POST /api/documents/:documentId/index
 * Trigger asynchronous ingestion of a document into the vector DB.
 */
router.post(
  '/documents/:documentId/index',
  requireRole('admin', 'lawyer', 'paralegal'),
  auditMiddleware('rag.index_document', 'document'),
  indexDocument,
);

/**
 * GET /api/documents/:documentId/index-status
 * Poll the indexing status of a document.
 */
router.get(
  '/documents/:documentId/index-status',
  requireRole('admin', 'lawyer', 'paralegal', 'billing'),
  getIndexStatus,
);

export default router;
