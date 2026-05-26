import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  MONGODB_URI: required('MONGODB_URI', 'mongodb://localhost:27017/vedaai'),
  REDIS_URL: required('REDIS_URL', 'redis://localhost:6379'),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
} as const;

export const isProd = env.NODE_ENV === 'production';
