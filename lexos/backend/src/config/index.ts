import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV:              z.enum(['development', 'test', 'production']).default('development'),
  PORT:                  z.coerce.number().default(4000),

  // PostgreSQL
  DATABASE_URL:          z.string().url(),

  // Supabase (Auth)
  SUPABASE_URL:          z.string().url(),
  SUPABASE_SERVICE_KEY:  z.string().min(1),
  SUPABASE_JWT_SECRET:   z.string().min(32),

  // OpenAI (embeddings + completions)
  OPENAI_API_KEY:        z.string().min(1),
  OPENAI_EMBEDDING_MODEL:z.string().default('text-embedding-3-large'),
  OPENAI_CHAT_MODEL:     z.string().default('gpt-4o'),

  // Pinecone (vector DB)
  PINECONE_API_KEY:      z.string().min(1),
  PINECONE_INDEX_NAME:   z.string().default('lexos-docs'),
  PINECONE_ENVIRONMENT:  z.string().default('us-east-1-aws'),

  // Encryption
  AES_MASTER_KEY:        z.string().length(64),  // 32-byte hex = 64 chars

  // Storage (S3-compatible)
  STORAGE_ENDPOINT:      z.string().url(),
  STORAGE_BUCKET:        z.string().min(1),
  STORAGE_ACCESS_KEY:    z.string().min(1),
  STORAGE_SECRET_KEY:    z.string().min(1),
  STORAGE_REGION:        z.string().default('eu-west-1'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS:  z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX:        z.coerce.number().default(100),

  // CORS
  ALLOWED_ORIGINS:       z.string().default('http://localhost:5173'),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
