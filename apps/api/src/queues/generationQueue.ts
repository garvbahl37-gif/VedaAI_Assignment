import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const GENERATION_QUEUE = 'generation';

export interface GenerationJobData {
  assignmentId: string;
}

export const generationQueue = new Queue<GenerationJobData>(GENERATION_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export async function enqueueGeneration(assignmentId: string): Promise<string> {
  // Deduplicate by job id — re-using assignmentId as job id prevents duplicates.
  const job = await generationQueue.add(
    'generate-paper',
    { assignmentId },
    { jobId: `gen:${assignmentId}:${Date.now()}` },
  );
  return job.id as string;
}
