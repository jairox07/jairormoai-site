import { db } from '../../config/database';
import { sha256 } from '../../utils/encryption';

interface AuditLogEntry {
  tenantId:     string;
  userId?:      string;
  clientId?:    string;
  sessionId?:   string;
  action:       string;
  resourceType: string;
  resourceId?:  string;
  ipAddress?:   string;
  userAgent?:   string;
  requestId?:   string;
  outcome?:     'success' | 'failure' | 'denied';
  detail?:      Record<string, unknown>;
}

/**
 * Appends an immutable audit record.
 * Failures are fire-and-forget — never throw, never block the request.
 * User-agent is stored as a one-way hash (GDPR minimization).
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.query(
      `INSERT INTO audit_logs
         (tenant_id, user_id, client_id, session_id, action, resource_type,
          resource_id, ip_address, user_agent_hash, request_id, outcome, detail)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::inet,$9,$10,$11,$12)`,
      [
        entry.tenantId,
        entry.userId      ?? null,
        entry.clientId    ?? null,
        entry.sessionId   ?? null,
        entry.action,
        entry.resourceType,
        entry.resourceId  ?? null,
        entry.ipAddress   ?? null,
        entry.userAgent   ? sha256(entry.userAgent) : null,
        entry.requestId   ?? null,
        entry.outcome     ?? 'success',
        JSON.stringify(entry.detail ?? {}),
      ],
    );
  } catch {
    // Intentionally silent: audit failures must not affect business operations
  }
}

/**
 * Audit middleware factory — attaches to Express routes via afterResponse.
 */
export function auditMiddleware(action: string, resourceType: string) {
  return async function(
    req: import('express').Request,
    res: import('express').Response,
    next: import('express').NextFunction,
  ): Promise<void> {
    res.on('finish', () => {
      if (!req.user) return;
      auditLog({
        tenantId:     req.user.tenantId,
        userId:       req.user.id,
        action,
        resourceType,
        resourceId:   (req.params['id'] as string | undefined),
        ipAddress:    req.ip,
        userAgent:    req.headers['user-agent'],
        requestId:    req.headers['x-request-id'] as string | undefined,
        outcome:      res.statusCode < 400 ? 'success' : 'failure',
        detail:       { method: req.method, path: req.path, status: res.statusCode },
      }).catch(() => {});
    });
    next();
  };
}
