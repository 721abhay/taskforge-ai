import { PrismaClient, Task, TaskStatus, Priority, TaskType } from '@taskforge/database';
import { NotFoundError } from '@taskforge/errors';

const prisma = new PrismaClient();

export class TaskService {
    async createTask(data: any, userId: string): Promise<Task> {
        const { projectId, ...taskData } = data;

        // Get the next task number for this project
        const lastTask = await prisma.task.findFirst({
            where: { projectId },
            orderBy: { taskNumber: 'desc' },
            select: { taskNumber: true },
        });

        const taskNumber = (lastTask?.taskNumber || 0) + 1;

        return prisma.task.create({
            data: {
                ...taskData,
                projectId,
                taskNumber,
                reporterId: userId,
            },
        });
    }

    async getTasksByProject(projectId: string): Promise<Task[]> {
        return prisma.task.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                assignee: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
            },
        });
    }

    async getTaskById(id: string): Promise<Task> {
        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                assignee: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
                reporter: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
                project: {
                    select: { id: true, name: true, key: true },
                },
                comments: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, avatarUrl: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!task) {
            throw new NotFoundError('Task not found');
        }

        return task;
    }

    async updateTask(id: string, data: any): Promise<Task> {
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            throw new NotFoundError('Task not found');
        }

        return prisma.task.update({
            where: { id },
            data,
        });
    }

    async deleteTask(id: string): Promise<void> {
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            throw new NotFoundError('Task not found');
        }

        await prisma.task.delete({ where: { id } });
    }

    async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            throw new NotFoundError('Task not found');
        }

        return prisma.task.update({
            where: { id },
            data: { status },
        });
    }
}

export const taskService = new TaskService();
