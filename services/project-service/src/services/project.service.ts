import { PrismaClient } from '@taskforge/database';

const prisma = new PrismaClient();

export class ProjectService {
    /**
     * Get all projects for a user
     */
    static async getUserProjects(userId: string) {
        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return projects;
    }

    /**
     * Create a new project
     */
    static async createProject(data: {
        name: string;
        description?: string;
        key: string;
        userId: string;
        organizationId: string;
    }) {
        const { name, description, key, userId, organizationId } = data;

        // Check if project key already exists in organization
        const existing = await prisma.project.findFirst({
            where: {
                organizationId,
                key,
            },
        });

        if (existing) {
            throw new Error('Project key already exists in this organization');
        }

        // Create project
        const project = await prisma.project.create({
            data: {
                name,
                description,
                key: key.toUpperCase(),
                organizationId,
                createdBy: userId,
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        return project;
    }

    /**
     * Get project by ID
     */
    static async getProjectById(projectId: string, userId: string) {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                avatarUrl: true,
                                role: true,
                            },
                        },
                    },
                },
                tasks: {
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!project) {
            throw new Error('Project not found or access denied');
        }

        return project;
    }

    /**
     * Update project
     */
    static async updateProject(
        projectId: string,
        userId: string,
        data: {
            name?: string;
            description?: string;
            status?: string;
            priority?: string;
        }
    ) {
        // Check if user has access
        const member = await prisma.projectMember.findFirst({
            where: {
                projectId,
                userId,
                role: {
                    in: ['OWNER', 'ADMIN'],
                },
            },
        });

        if (!member) {
            throw new Error('Access denied');
        }

        const project = await prisma.project.update({
            where: { id: projectId },
            data,
        });

        return project;
    }

    /**
     * Delete project
     */
    static async deleteProject(projectId: string, userId: string) {
        // Check if user is owner
        const member = await prisma.projectMember.findFirst({
            where: {
                projectId,
                userId,
                role: 'OWNER',
            },
        });

        if (!member) {
            throw new Error('Only project owner can delete the project');
        }

        await prisma.project.delete({
            where: { id: projectId },
        });
    }
}

export class TaskService {
    /**
     * Create a new task
     */
    static async createTask(data: {
        projectId: string;
        title: string;
        description?: string;
        assigneeId?: string;
        priority?: string;
        status?: string;
        userId: string;
    }) {
        const { projectId, title, description, assigneeId, priority, status, userId } = data;

        // Get next task number for project
        const lastTask = await prisma.task.findFirst({
            where: { projectId },
            orderBy: { taskNumber: 'desc' },
        });

        const taskNumber = (lastTask?.taskNumber || 0) + 1;

        const task = await prisma.task.create({
            data: {
                projectId,
                title,
                description,
                taskNumber,
                assigneeId,
                reporterId: userId,
                priority: priority || 'MEDIUM',
                status: status || 'TODO',
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return task;
    }

    /**
     * Update task
     */
    static async updateTask(
        taskId: string,
        data: {
            title?: string;
            description?: string;
            status?: string;
            priority?: string;
            assigneeId?: string;
        }
    ) {
        const task = await prisma.task.update({
            where: { id: taskId },
            data,
            include: {
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return task;
    }

    /**
     * Delete task
     */
    static async deleteTask(taskId: string) {
        await prisma.task.delete({
            where: { id: taskId },
        });
    }

    /**
     * Get tasks for a project
     */
    static async getProjectTasks(projectId: string) {
        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return tasks;
    }
}
