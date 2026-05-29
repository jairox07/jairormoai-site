import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   // 96-bit IV recommended for GCM
const TAG_LENGTH = 16;  // 128-bit auth tag

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a single string: base64(iv):base64(tag):base64(ciphertext)
 */
export function encrypt(plaintext: string): string {
  const key = Buffer.from(config.AES_MASTER_KEY, 'hex');
  const iv  = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypts a value produced by encrypt().
 */
export function decrypt(encoded: string): string {
  const key = Buffer.from(config.AES_MASTER_KEY, 'hex');
  const parts = encoded.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted payload format');

  const [ivB64, tagB64, dataB64] = parts as [string, string, string];
  const iv         = Buffer.from(ivB64,  'base64');
  const authTag    = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(dataB64,'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * SHA-256 hash — used for audit log anonymization.
 * Never use this to store passwords (use bcrypt/argon2 instead).
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Generates a cryptographically secure random token of N bytes (hex-encoded).
 */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
