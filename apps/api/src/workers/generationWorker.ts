import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { GENERATION_QUEUE, type GenerationJobData } from '../queues/generationQueue';
import { Assignment } from '../models/Assignment';
import { runGenerationPipeline } from '../services/generationPipeline';
import { wsManager } from '../websocket/wsManager';
import type { WSMessage } from '@vedaai/shared';

export function startGenerationWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      const { assignmentId } = job.data;
      const jobId = job.id as string;

      const result = await runGenerationPipeline(
        assignmentId,
        jobId,
        async (e) => {
          await job.updateProgress(e.progress);
          if (e.stage === 'done') {
            wsManager.sendToJob(jobId, {
              type: 'completed',
              progress: 100,
              paperId: '', // populated below
            } as WSMessage);
            return;
          }
          wsManager.sendToJob(jobId, {
            type: 'progress',
            stage: e.stage,
            progress: e.progress,
            message: e.message,
          });
        },
      );

      // Final completed event with the real paperId.
      wsManager.sendToJob(jobId, {
        type: 'completed',
        progress: 100,
        paperId: result.paperId,
      });

      return result;
    },
    { connection: redisConnection, concurrency: 5 },
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const jobId = job.id as string;
    // eslint-disable-next-line no-console
    console.error(`[worker] job ${jobId} failed:`, err.message);
    try {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' });
    } catch { /* swallow */ }
    wsManager.sendToJob(jobId, { type: 'failed', error: err.message });
  });

  worker.on('completed', (job) => {
    // eslint-disable-next-line no-console
    console.log(`[worker] job ${job.id} completed`);
  });

  // eslint-disable-next-line no-console
  console.log('[worker] generation worker started');
  return worker;
}
