import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '@taskforge/middleware';

const router = Router();
const auth = authMiddleware(process.env.JWT_SECRET || 'dev_secret');

// All routes require authentication
router.use(auth);

// Project routes
router.get('/', ProjectController.getProjects);
router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProject);
router.patch('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

export default router;
