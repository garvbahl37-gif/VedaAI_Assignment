import { Router } from 'express';
import {
  listAssignments,
  getAssignment,
  createAssignment,
  deleteAssignment,
  getAssignmentPaper,
  regenerateAssignment,
  createAssignmentSchema,
} from '../controllers/assignmentController';
import { validateBody } from '../middleware/validate';

const router = Router();

router.get('/', listAssignments);
router.post('/', validateBody(createAssignmentSchema), createAssignment);
router.get('/:id', getAssignment);
router.delete('/:id', deleteAssignment);
router.get('/:id/paper', getAssignmentPaper);
router.post('/:id/regenerate', regenerateAssignment);

export default router;
