import { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema, taskIdSchema, projectIdSchema } from '../validators/task.validator';
import { BadRequestError } from '@taskforge/errors';

export class TaskController {
    async createTask(req: Request, res: Response) {
        const validatedData = createTaskSchema.parse(req.body);
        const userId = (req as any).user.id;
        const task = await taskService.createTask(validatedData, userId);
        res.status(201).json({ success: true, data: task });
    }

    async getTasksByProject(req: Request, res: Response) {
        const { projectId } = projectIdSchema.parse(req.params);
        const tasks = await taskService.getTasksByProject(projectId);
        res.json({ success: true, data: tasks });
    }

    async getTaskById(req: Request, res: Response) {
        const { id } = taskIdSchema.parse(req.params);
        const task = await taskService.getTaskById(id);
        res.json({ success: true, data: task });
    }

    async updateTask(req: Request, res: Response) {
        const { id } = taskIdSchema.parse(req.params);
        const validatedData = updateTaskSchema.parse(req.body);
        const task = await taskService.updateTask(id, validatedData);
        res.json({ success: true, data: task });
    }

    async deleteTask(req: Request, res: Response) {
        const { id } = taskIdSchema.parse(req.params);
        await taskService.deleteTask(id);
        res.json({ success: true, message: 'Task deleted successfully' });
    }

    async updateTaskStatus(req: Request, res: Response) {
        const { id } = taskIdSchema.parse(req.params);
        const { status } = req.body;
        if (!status) {
            throw new BadRequestError('Status is required');
        }
        const task = await taskService.updateTaskStatus(id, status);
        res.json({ success: true, data: task });
    }
}

export const taskController = new TaskController();
