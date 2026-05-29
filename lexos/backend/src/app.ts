import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import ragRoutes from './modules/rag/rag.routes';
import { AppError } from './utils/errors';

const app = express();

// ─── Security headers ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'"],
      imgSrc:     ["'self'", 'data:'],
    },
  },
  hsts: { maxAge: 31_536_000, includeSubDomains: true },
}));

// ─── CORS (whitelisted origins only) ──────────────────────────────────────
const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  methods:     ['GET','POST','PUT','PATCH','DELETE'],
  credentials: true,
}));

// ─── Request tracing ───────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] ?? uuidv4();
  next();
});

// ─── Parsing & compression ─────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Global rate limiter ───────────────────────────────────────────────────
app.use(rateLimit({
  windowMs:          config.RATE_LIMIT_WINDOW_MS,
  max:               config.RATE_LIMIT_MAX,
  standardHeaders:   true,
  legacyHeaders:     false,
  message:           { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
  skip:              (req) => req.ip === '127.0.0.1' && config.NODE_ENV === 'development',
}));

// Stricter limiter for AI-powered endpoints (cost control)
const aiRateLimit = rateLimit({
  windowMs: 60_000,  // 1 minute
  max:      20,
  message:  { error: 'AI query limit exceeded. Wait 1 minute.', code: 'AI_RATE_LIMIT' },
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api/rag',   aiRateLimit, ragRoutes);
// Additional module routes registered here as they are built:
// app.use('/api/auth',      authRoutes);
// app.use('/api/clients',   clientRoutes);
// app.use('/api/cases',     caseRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/contracts', contractRoutes);
// app.use('/api/billing',   billingRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

// ─── Global error handler ─────────────────────────────────────────────────
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error:     err.message,
      code:      err.code,
      requestId: req.headers['x-request-id'],
    });
    return;
  }

  if (config.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(500).json({
    error:     'Internal server error',
    code:      'INTERNAL_ERROR',
    requestId: req.headers['x-request-id'],
  });
});

export default app;
