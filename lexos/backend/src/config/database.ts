import { Pool, PoolClient } from 'pg';
import { config } from './index';

export const db = new Pool({
  connectionString: config.DATABASE_URL,
  max:              20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

db.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

/**
 * Execute a query within a tenant-scoped context.
 * Sets `app.current_tenant_id` so RLS policies apply automatically.
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  values?: unknown[],
) {
  const res = await db.query<T>(sql, values);
  return res;
}
