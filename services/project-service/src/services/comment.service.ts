import { PrismaClient } from '@taskforge/database';

const prisma = new PrismaClient();

export class CommentService {
    /**
     * Create a comment on a task
     */
    static async createComment(data: {
        taskId: string;
        userId: string;
        content: string;
    }) {
        const { taskId, userId, content } = data;

        const comment = await prisma.comment.create({
            data: {
                taskId,
                userId,
                content,
            },
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
        });

        return comment;
    }

    /**
     * Get all comments for a task
     */
    static async getTaskComments(taskId: string) {
        const comments = await prisma.comment.findMany({
            where: { taskId },
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
            orderBy: {
                createdAt: 'asc',
            },
        });

        return comments;
    }

    /**
     * Update a comment
     */
    static async updateComment(
        commentId: string,
        userId: string,
        content: string
    ) {
        // Check if user owns the comment
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            throw new Error('Comment not found');
        }

        if (comment.userId !== userId) {
            throw new Error('You can only edit your own comments');
        }

        const updated = await prisma.comment.update({
            where: { id: commentId },
            data: { content },
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
        });

        return updated;
    }

    /**
     * Delete a comment
     */
    static async deleteComment(commentId: string, userId: string) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            throw new Error('Comment not found');
        }

        if (comment.userId !== userId) {
            throw new Error('You can only delete your own comments');
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });
    }
}
