import { Router } from 'express';
import { quickQuiz, quickQuizSchema } from '../controllers/toolkitController';
import { validateBody } from '../middleware/validate';

const router = Router();

router.post('/quick-quiz', validateBody(quickQuizSchema), quickQuiz);

export default router;
