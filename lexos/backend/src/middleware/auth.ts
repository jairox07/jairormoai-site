import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { auditLog } from '../modules/audit/audit.service';
import { AppError } from '../utils/errors';

// Service-level Supabase client (bypasses RLS, used only for token verification)
const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

export interface AuthenticatedUser {
  id:       string;
  tenantId: string;
  email:    string;
  role:     string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * JWT authentication middleware.
 * Verifies Supabase JWT, loads user+tenant from DB, attaches to req.user.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Missing authorization token', 401, 'AUTH_REQUIRED');
    }

    const token = authHeader.slice(7);

    // Verify JWT with Supabase
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !supabaseUser) {
      throw new AppError('Invalid or expired token', 401, 'AUTH_INVALID');
    }

    // Load user profile and tenant from our DB
    const { rows } = await import('../config/database').then(m =>
      m.query<AuthenticatedUser & { tenant_id: string; supabase_uid: string }>(
        `SELECT u.id, u.tenant_id, u.email, u.role
         FROM users u
         WHERE u.supabase_uid = $1 AND u.is_active = TRUE
         LIMIT 1`,
        [supabaseUser.id],
      )
    );

    if (rows.length === 0) {
      throw new AppError('User not found or inactive', 401, 'USER_NOT_FOUND');
    }

    const row = rows[0]!;
    req.user = {
      id:       row.id,
      tenantId: row.tenant_id,
      email:    row.email,
      role:     row.role,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) {
      await auditLog({
        tenantId:     'unknown',
        userId:       undefined,
        action:       'auth.failed',
        resourceType: 'session',
        outcome:      'denied',
        ipAddress:    req.ip,
        detail:       { reason: err.code },
      });
      res.status(err.statusCode).json({ error: err.message, code: err.code });
    } else {
      next(err);
    }
  }
}

/**
 * Role-based access control middleware factory.
 * Usage: requireRole('admin','lawyer')
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', code: 'AUTH_REQUIRED' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      auditLog({
        tenantId:     req.user.tenantId,
        userId:       req.user.id,
        action:       'auth.forbidden',
        resourceType: 'route',
        resourceId:   req.path,
        outcome:      'denied',
        ipAddress:    req.ip,
        detail:       { requiredRoles: allowedRoles, userRole: req.user.role },
      }).catch(() => {});
      res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
      return;
    }
    next();
  };
}
