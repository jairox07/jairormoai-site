import { useState, useRef, useEffect } from 'react';
import {
  Search, Shield, BookOpen, FileText, Layers,
  Send, Loader2, AlertTriangle, CheckCircle, Clock,
  ChevronDown, ChevronUp, Cpu, Zap,
} from 'lucide-react';
import { useRagQuery, useRiskAnalysis, type QueryType, type RagResult, type RagSource } from '../../hooks/useRag';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

// ─── Query type configuration ─────────────────────────────────────────────

const QUERY_TYPES: {
  id:          QueryType;
  label:       string;
  icon:        React.ElementType;
  placeholder: string;
  color:       string;
}[] = [
  {
    id:          'semantic_search',
    label:       'Búsqueda',
    icon:        Search,
    placeholder: '¿Cuáles son las condiciones de resolución anticipada del contrato?',
    color:       'text-brand-500 bg-brand-50 dark:bg-brand-950',
  },
  {
    id:          'risk_analysis',
    label:       'Riesgos',
    icon:        Shield,
    placeholder: 'Analiza los riesgos de este contrato de arrendamiento…',
    color:       'text-red-500 bg-red-50 dark:bg-red-950',
  },
  {
    id:          'summarize',
    label:       'Resumen',
    icon:        FileText,
    placeholder: 'Resume los puntos clave de este expediente…',
    color:       'text-emerald-500 bg-emerald-50 dark:bg-emerald-950',
  },
  {
    id:          'jurisprudence',
    label:       'Jurisprudencia',
    icon:        BookOpen,
    placeholder: '¿Qué criterio mantiene el TS sobre la nulidad de cláusulas suelo?',
    color:       'text-amber-500 bg-amber-50 dark:bg-amber-950',
  },
  {
    id:          'clause_extract',
    label:       'Cláusulas',
    icon:        Layers,
    placeholder: 'Extrae todas las cláusulas de penalización del contrato…',
    color:       'text-purple-500 bg-purple-50 dark:bg-purple-950',
  },
];

// ─── Risk badge component ─────────────────────────────────────────────────

function RiskBadge({ level }: { level: 'ALTO' | 'MEDIO' | 'BAJO' }) {
  const colors = {
    ALTO:  'bg-red-100    text-red-700   dark:bg-red-900/40   dark:text-red-300',
    MEDIO: 'bg-amber-100  text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    BAJO:  'bg-green-100  text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide', colors[level])}>
      {level}
    </span>
  );
}

// ─── Source card component ─────────────────────────────────────────────────

function SourceCard({ source, index }: { source: RagSource; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const relevancePct = Math.round(source.score * 100);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3
                   bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750
                   transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500 text-white
                           text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <span className="truncate font-medium text-gray-800 dark:text-gray-200">
            {source.filename}
          </span>
          {source.pageNumber > 0 && (
            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400 text-xs">
              Pág. {source.pageNumber}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${relevancePct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{relevancePct}%</span>
          </div>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && source.snippet && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700
                        bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300
                        font-mono text-xs leading-relaxed animate-fade-in">
          "{source.snippet}"
        </div>
      )}
    </div>
  );
}

// ─── Answer renderer (parses risk levels inline) ──────────────────────────

function AnswerContent({ text, queryType }: { text: string; queryType: QueryType }) {
  if (queryType !== 'risk_analysis') {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300
                      leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    );
  }

  // Parse risk levels for visual highlighting
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const isHigh   = /\bALTO\b/i.test(line);
        const isMedium = /\bMEDIO\b/i.test(line);
        const isLow    = /\bBAJO\b/i.test(line);

        return (
          <div
            key={i}
            className={clsx(
              'px-3 py-1.5 rounded text-sm leading-relaxed',
              isHigh   && 'bg-red-50   dark:bg-red-950/30   border-l-2 border-red-400',
              isMedium && 'bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-400',
              isLow    && 'bg-green-50 dark:bg-green-950/30 border-l-2 border-green-400',
              !isHigh && !isMedium && !isLow && 'text-gray-700 dark:text-gray-300',
            )}
          >
            {line.replace(/\b(ALTO|MEDIO|BAJO)\b/gi, '')}
            {isHigh   && <RiskBadge level="ALTO"  />}
            {isMedium && <RiskBadge level="MEDIO" />}
            {isLow    && <RiskBadge level="BAJO"  />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────

export default function ResearchPage() {
  const [queryType, setQueryType]     = useState<QueryType>('semantic_search');
  const [query, setQuery]             = useState('');
  const [result, setResult]           = useState<RagResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef  = useRef<HTMLDivElement>(null);

  const ragQuery   = useRagQuery();
  const riskQuery  = useRiskAnalysis();
  const isLoading  = ragQuery.isPending || riskQuery.isPending;

  const activeType = QUERY_TYPES.find(t => t.id === queryType)!;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [query]);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    try {
      const res = await ragQuery.mutateAsync({
        query:     trimmed,
        queryType,
      });
      setResult(res);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la consulta';
      toast.error(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10">
            <Cpu size={22} className="text-brand-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Investigación Legal IA
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Búsqueda semántica y análisis sobre tus documentos indexados
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Query type selector */}
        <div className="flex flex-wrap gap-2">
          {QUERY_TYPES.map(type => {
            const Icon    = type.icon;
            const isActive = queryType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => { setQueryType(type.id); setQuery(''); setResult(null); }}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                  'border transition-all duration-150',
                  isActive
                    ? `${type.color} border-current shadow-sm`
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900',
                )}
              >
                <Icon size={15} />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Query input */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-card overflow-hidden">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeType.placeholder}
            rows={3}
            className="w-full px-5 pt-4 pb-2 resize-none text-gray-900 dark:text-white
                       bg-transparent placeholder-gray-400 dark:placeholder-gray-600
                       text-[15px] leading-relaxed outline-none"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between px-4 pb-4">
            <p className="text-xs text-gray-400 dark:text-gray-600 select-none">
              Ctrl+Enter para enviar
            </p>
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold',
                'transition-all duration-150',
                query.trim() && !isLoading
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-glow'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed',
              )}
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Analizando…</>
              ) : (
                <><Send size={15} /> Consultar</>
              )}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-brand-200 dark:border-brand-900" />
              <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-brand-500
                              border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Buscando en documentos…
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
                Recuperando fragmentos relevantes y generando respuesta
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div ref={resultsRef} className="space-y-4 animate-slide-up">

            {/* Answer card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
                            dark:border-gray-700 shadow-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className={clsx('p-1.5 rounded-lg', activeType.color)}>
                  {<activeType.icon size={16} />}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Respuesta
                </span>
                <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Zap size={12} />
                    {result.tokensUsed.toLocaleString()} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {(result.durationMs / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
              <div className="px-5 py-4">
                <AnswerContent text={result.answer} queryType={result.queryType} />
              </div>
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
                              dark:border-gray-700 shadow-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    Fuentes ({result.sources.length})
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    Documentos utilizados por la IA
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {result.sources.map((src, i) => (
                    <SourceCard key={`${src.documentId}-${src.chunkIndex}`} source={src} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Privacy notice */}
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                            bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300
                            border border-blue-200 dark:border-blue-800 text-xs">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                Esta IA solo analiza documentos de tu despacho. Tu consulta no se usa
                para entrenar modelos externos. Registro de auditoría generado conforme a GDPR.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
