import mongoose from 'mongoose';
import { env } from './env';

let connected = false;

export async function connectMongo(): Promise<void> {
  if (connected) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
  connected = true;
  // eslint-disable-next-line no-console
  console.log(`[mongo] connected → ${env.MONGODB_URI}`);
}

export async function disconnectMongo(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}
