'use client';

import TaskComments from './TaskComments';

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    taskNumber: number;
    assignee: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
    } | null;
}

interface TaskDetailModalProps {
    task: Task;
    projectKey: string;
    onClose: () => void;
}

const PRIORITIES = [
    { id: 'LOW', label: 'Low', color: 'text-slate-400' },
    { id: 'MEDIUM', label: 'Medium', color: 'text-blue-400' },
    { id: 'HIGH', label: 'High', color: 'text-orange-400' },
    { id: 'URGENT', label: 'Urgent', color: 'text-red-400' },
];

const STATUSES = [
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'IN_REVIEW', label: 'In Review' },
    { id: 'DONE', label: 'Done' },
];

export default function TaskDetailModal({ task, projectKey, onClose }: TaskDetailModalProps) {
    const priorityColor = PRIORITIES.find(p => p.id === task.priority)?.color || 'text-slate-400';
    const statusLabel = STATUSES.find(s => s.id === task.status)?.label || task.status;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-slate-900 rounded-2xl border border-white/20 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-slate-900 border-b border-white/20 p-6 flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-slate-400 font-mono">
                                {projectKey}-{task.taskNumber}
                            </span>
                            <span className={`px-2 py-1 bg-white/10 rounded text-xs ${priorityColor}`}>
                                {PRIORITIES.find(p => p.id === task.priority)?.label}
                            </span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                {statusLabel}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">{task.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Description</h3>
                        {task.description ? (
                            <p className="text-slate-200 whitespace-pre-wrap">{task.description}</p>
                        ) : (
                            <p className="text-slate-500 italic">No description provided</p>
                        )}
                    </div>

                    {/* Assignee */}
                    {task.assignee && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-2">Assignee</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
                                    {task.assignee.fullName.charAt(0)}
                                </div>
                                <span className="text-slate-200">{task.assignee.fullName}</span>
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 mb-4">Comments</h3>
                        <TaskComments taskId={task.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
