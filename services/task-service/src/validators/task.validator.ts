import { z } from 'zod';

export const createTaskSchema = z.object({
    projectId: z.string().uuid(),
    title: z.string().min(1).max(500),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CANCELLED']).default('TODO'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    type: z.enum(['TASK', 'BUG', 'FEATURE', 'EPIC', 'STORY']).default('TASK'),
    assigneeId: z.string().uuid().optional(),
    estimatedHours: z.number().min(0).optional(),
    dueDate: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdSchema = z.object({
    id: z.string().uuid(),
});

export const projectIdSchema = z.object({
    projectId: z.string().uuid(),
});
