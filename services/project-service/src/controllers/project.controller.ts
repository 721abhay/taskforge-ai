import { Request, Response, NextFunction } from 'express';
import { ProjectService, TaskService } from '../services/project.service';
import { createDefaultOrganization } from '../utils/organization';
import { z } from 'zod';

const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    key: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/, 'Project key must be uppercase letters and numbers'),
    organizationId: z.string().uuid().optional(),
});

const createTaskSchema = z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    assigneeId: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CANCELLED']).optional(),
});

export class ProjectController {
    static async getProjects(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const projects = await ProjectService.getUserProjects(userId);

            res.json({
                success: true,
                data: { projects },
            });
        } catch (error) {
            next(error);
        }
    }

    static async createProject(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const data = createProjectSchema.parse(req.body);

            // Create default organization if not provided
            let organizationId = data.organizationId;
            if (!organizationId) {
                const org = await createDefaultOrganization(userId);
                organizationId = org.id;
            }

            const project = await ProjectService.createProject({
                ...data,
                userId,
                organizationId,
            });

            res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: { project },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getProject(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            const project = await ProjectService.getProjectById(id, userId);

            res.json({
                success: true,
                data: { project },
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateProject(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            const project = await ProjectService.updateProject(id, userId, req.body);

            res.json({
                success: true,
                message: 'Project updated successfully',
                data: { project },
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteProject(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            await ProjectService.deleteProject(id, userId);

            res.json({
                success: true,
                message: 'Project deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export class TaskController {
    static async createTask(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { projectId } = req.params;
            const data = createTaskSchema.parse(req.body);

            const task = await TaskService.createTask({
                ...data,
                projectId,
                userId,
            });

            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: { task },
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const task = await TaskService.updateTask(id, req.body);

            res.json({
                success: true,
                message: 'Task updated successfully',
                data: { task },
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await TaskService.deleteTask(id);

            res.json({
                success: true,
                message: 'Task deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    static async getProjectTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectId } = req.params;
            const tasks = await TaskService.getProjectTasks(projectId);

            res.json({
                success: true,
                data: { tasks },
            });
        } catch (error) {
            next(error);
        }
    }
}
