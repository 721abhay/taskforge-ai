import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { z } from 'zod';

const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty'),
});

const updateCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty'),
});

export class CommentController {
    static async createComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { taskId } = req.params;
            const { content } = createCommentSchema.parse(req.body);

            const comment = await CommentService.createComment({
                taskId,
                userId,
                content,
            });

            res.status(201).json({
                success: true,
                message: 'Comment created successfully',
                data: { comment },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getTaskComments(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId } = req.params;
            const comments = await CommentService.getTaskComments(taskId);

            res.json({
                success: true,
                data: { comments },
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const { content } = updateCommentSchema.parse(req.body);

            const comment = await CommentService.updateComment(id, userId, content);

            res.json({
                success: true,
                message: 'Comment updated successfully',
                data: { comment },
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            await CommentService.deleteComment(id, userId);

            res.json({
                success: true,
                message: 'Comment deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}
