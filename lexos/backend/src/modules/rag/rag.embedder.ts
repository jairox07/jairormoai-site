import OpenAI from 'openai';
import { config } from '../../config';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const MAX_CHARS_PER_CHUNK = 1_500;   // ~375 tokens, well within 8k context
const CHUNK_OVERLAP_CHARS  = 200;

export interface TextChunk {
  index:      number;
  text:       string;
  pageNumber: number | null;
  charStart:  number;
  charEnd:    number;
  tokenCount: number; // estimated
}

/**
 * Splits a long document text into overlapping chunks for embedding.
 * Respects paragraph boundaries when possible.
 */
export function chunkText(text: string, pageMap?: Map<number, number>): TextChunk[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const paragraphs = normalized.split(/\n\n+/);
  const chunks: TextChunk[] = [];

  let buffer       = '';
  let bufferStart  = 0;
  let charCursor   = 0;
  let chunkIndex   = 0;

  const flushBuffer = () => {
    if (buffer.trim().length < 50) return; // skip trivially small chunks
    chunks.push({
      index:      chunkIndex++,
      text:       buffer.trim(),
      pageNumber: pageMap?.get(bufferStart) ?? null,
      charStart:  bufferStart,
      charEnd:    charCursor,
      tokenCount: Math.ceil(buffer.length / 4),
    });
  };

  for (const para of paragraphs) {
    if (buffer.length + para.length > MAX_CHARS_PER_CHUNK && buffer.length > 0) {
      flushBuffer();
      // carry over tail for overlap
      const overlap = buffer.slice(-CHUNK_OVERLAP_CHARS);
      bufferStart = charCursor - overlap.length;
      buffer = overlap + '\n\n' + para;
    } else {
      buffer += (buffer ? '\n\n' : '') + para;
    }
    charCursor += para.length + 2;
  }
  flushBuffer();

  return chunks;
}

/**
 * Generates embeddings for a batch of text chunks via OpenAI.
 * Batches up to 96 inputs per API call (OpenAI limit is 2048 but we stay conservative).
 */
export async function embedChunks(chunks: TextChunk[]): Promise<number[][]> {
  const BATCH_SIZE = 96;
  const allVectors: number[][] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE).map(c => c.text);

    const response = await openai.embeddings.create({
      model: config.OPENAI_EMBEDDING_MODEL,
      input: batch,
      encoding_format: 'float',
    });

    const sorted = response.data
      .sort((a, b) => a.index - b.index)
      .map(d => d.embedding);

    allVectors.push(...sorted);
  }

  return allVectors;
}

/**
 * Embeds a single query string for similarity search.
 */
export async function embedQuery(queryText: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: config.OPENAI_EMBEDDING_MODEL,
    input: queryText.slice(0, 8_000), // safety truncation
    encoding_format: 'float',
  });
  return response.data[0]!.embedding;
}
