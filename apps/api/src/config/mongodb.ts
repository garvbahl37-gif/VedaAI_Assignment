import mongoose, { Mongoose } from 'mongoose';
import { env } from './env';

// In serverless (Vercel), the function module gets re-evaluated on cold starts
// but stays warm between invocations within the same container. Cache the
// connection on globalThis so we re-use it across warm invocations.
interface MongoCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalForMongo = globalThis as unknown as { __mongoose?: MongoCache };
const cached: MongoCache =
  globalForMongo.__mongoose ?? (globalForMongo.__mongoose = { conn: null, promise: null });

export async function connectMongo(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  // eslint-disable-next-line no-console
  console.log(`[mongo] connected`);
  return cached.conn;
}

export async function disconnectMongo(): Promise<void> {
  if (!cached.conn) return;
  await mongoose.disconnect();
  cached.conn = null;
  cached.promise = null;
}
