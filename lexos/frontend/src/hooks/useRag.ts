import { useMutation } from '@tanstack/react-query';
import { api } from '../utils/api';

export type QueryType = 'semantic_search' | 'risk_analysis' | 'summarize' | 'jurisprudence' | 'clause_extract';

export interface RagSource {
  documentId:  string;
  filename:    string;
  chunkIndex:  number;
  pageNumber:  number;
  score:       number;
  snippet:     string;
}

export interface RagResult {
  answer:     string;
  sources:    RagSource[];
  queryType:  QueryType;
  tokensUsed: number;
  durationMs: number;
}

interface QueryInput {
  query:        string;
  queryType:    QueryType;
  documentIds?: string[];
  caseId?:      string;
}

export function useRagQuery() {
  return useMutation<RagResult, Error, QueryInput>({
    mutationFn: (input) => api.post<RagResult>('/rag/query', input).then(r => r.data),
  });
}

export function useRiskAnalysis() {
  return useMutation<RagResult, Error, { documentIds: string[]; caseId?: string }>({
    mutationFn: (input) => api.post<RagResult>('/rag/risk', input).then(r => r.data),
  });
}

export function useIndexDocument() {
  return useMutation<{ message: string; documentId: string }, Error, string>({
    mutationFn: (documentId) =>
      api.post(`/rag/documents/${documentId}/index`).then(r => r.data),
  });
}
