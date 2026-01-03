import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authMiddleware } from '@taskforge/middleware';

const router = Router();
const auth = authMiddleware(process.env.JWT_SECRET || 'dev_secret');

router.post('/', auth, taskController.createTask);
router.get('/project/:projectId', auth, taskController.getTasksByProject);
router.get('/:id', auth, taskController.getTaskById);
router.patch('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);
router.patch('/:id/status', auth, taskController.updateTaskStatus);

export default router;
