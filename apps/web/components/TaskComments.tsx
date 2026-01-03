'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        avatarUrl: string | null;
    };
}

interface TaskCommentsProps {
    taskId: string;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
    const { user } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    const fetchComments = async () => {
        try {
            const response = await api.get(`http://localhost:5002/tasks/${taskId}/comments`);
            setComments(response.data.data.comments);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post(`http://localhost:5002/tasks/${taskId}/comments`, {
                content: newComment,
            });
            setNewComment('');
            fetchComments();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            await api.patch(`http://localhost:5002/comments/${commentId}`, {
                content: editContent,
            });
            setEditingId(null);
            setEditContent('');
            fetchComments();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update comment');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;

        try {
            await api.delete(`http://localhost:5002/comments/${commentId}`);
            fetchComments();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete comment');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-4">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {user?.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim()}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                {isSubmitting ? 'Posting...' : 'Comment'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center text-slate-400 py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm">Loading comments...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">No comments yet</p>
                        <p className="text-xs mt-1">Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {comment.user.fullName.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-white font-medium text-sm">{comment.user.fullName}</p>
                                            <p className="text-slate-400 text-xs">{formatDate(comment.createdAt)}</p>
                                        </div>
                                        {user?.id === comment.user.id && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(comment.id);
                                                        setEditContent(comment.content);
                                                    }}
                                                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {editingId === comment.id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(comment.id)}
                                                    className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditContent('');
                                                    }}
                                                    className="px-3 py-1 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-200 text-sm whitespace-pre-wrap">{comment.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
