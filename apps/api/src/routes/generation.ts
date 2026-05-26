import { Router } from 'express';
import { getJobStatus } from '../controllers/generationController';

const router = Router();

router.get('/:jobId/status', getJobStatus);

export default router;
