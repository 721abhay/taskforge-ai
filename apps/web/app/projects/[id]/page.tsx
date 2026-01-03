'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';
import TaskDetailModal from '@/components/TaskDetailModal';
import ProjectChat from '@/components/ProjectChat';
import { io, Socket } from 'socket.io-client';

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
    _count?: {
        comments: number;
    };
}

interface Project {
    id: string;
    name: string;
    description: string | null;
    key: string;
    status: string;
    tasks: Task[];
    members: any[];
}

const STATUSES = [
    { id: 'TODO', label: 'To Do', color: 'bg-slate-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
    { id: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-500' },
    { id: 'DONE', label: 'Done', color: 'bg-green-500' },
];

const PRIORITIES = [
    { id: 'LOW', label: 'Low', color: 'text-slate-400' },
    { id: 'MEDIUM', label: 'Medium', color: 'text-blue-400' },
    { id: 'HIGH', label: 'High', color: 'text-orange-400' },
    { id: 'URGENT', label: 'Urgent', color: 'text-red-400' },
];

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
    });
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('ALL');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showAIGenerate, setShowAIGenerate] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [quickTaskText, setQuickTaskText] = useState('');
    const [isParsingQuickTask, setIsParsingQuickTask] = useState(false);
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchProject();

        // Socket integration
        const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5004';
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.emit('join-project', {
            projectId: params.id,
            userId: user?.id,
            fullName: user?.fullName
        });

        newSocket.on('presence-update', (users: string[]) => {
            setActiveUsers(users);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, params.id, user?.id, user?.fullName]);

    const fetchProject = async () => {
        try {
            const response = await api.get(`/projects/${params.id}`);
            setProject(response.data.data.project);
        } catch (error) {
            console.error('Failed to fetch project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            await api.post(`/projects/${params.id}/tasks`, newTask);
            setShowCreateTask(false);
            setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'TODO' });
            fetchProject();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            await api.patch(`/tasks/${taskId}`, { status: newStatus });
            fetchProject();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await api.delete(`/tasks/${taskId}`);
            fetchProject();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const generateWithAI = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);

        try {
            const response = await api.post('/ai/generate-tasks', {
                project_description: aiPrompt,
                num_tasks: 5
            });

            const generatedTasks = response.data.tasks;

            if (generatedTasks && Array.isArray(generatedTasks)) {
                for (const task of generatedTasks) {
                    await api.post(`/projects/${params.id}/tasks`, {
                        title: task.title,
                        description: task.description,
                        priority: task.priority,
                        status: 'TODO'
                    });
                }
            }

            setShowAIGenerate(false);
            setAiPrompt('');
            fetchProject();
        } catch (error: any) {
            console.error('AI Generation error:', error);
            alert(error.response?.data?.message || 'AI Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleQuickTask = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && quickTaskText.trim()) {
            setIsParsingQuickTask(true);
            try {
                const response = await api.post('/ai/parse', {
                    text: quickTaskText
                });

                const task = response.data;

                await api.post(`/projects/${params.id}/tasks`, {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: 'TODO'
                });

                setQuickTaskText('');
                fetchProject();
            } catch (error) {
                console.error('Failed to parse quick task:', error);
            } finally {
                setIsParsingQuickTask(false);
            }
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <p>Project not found</p>
                    <Link href="/projects" className="text-purple-400 hover:underline mt-4 inline-block">
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    const tasksByStatus = STATUSES.reduce((acc, status) => {
        acc[status.id] = project.tasks.filter((task) => task.status === status.id);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/dashboard">
                                <h1 className="text-2xl font-bold text-white cursor-pointer">
                                    Task<span className="text-purple-400">Forge</span> AI
                                </h1>
                            </Link>
                            <Link href="/projects" className="text-slate-300 hover:text-purple-400 transition">
                                Projects
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-slate-300">{user.fullName}</span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Project Header */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-white">{project.name}</h2>
                                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-200 rounded-full text-sm font-mono">
                                    {project.key}
                                </span>
                            </div>
                            <p className="text-slate-300">{project.description || 'No description'}</p>
                            <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                                <span>{project.tasks.length} tasks</span>
                                <span>•</span>
                                <span>{project.members.length} members</span>
                                <span>•</span>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                    <span>{activeUsers.length} online</span>
                                    <div className="flex -space-x-2 ml-2">
                                        {activeUsers.map((name, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-purple-600 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold" title={name}>
                                                {name.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAIGenerate(true)}
                                className="px-6 py-3 bg-white/10 border border-purple-500/30 text-purple-200 font-semibold rounded-lg hover:bg-white/20 transition flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                AI Generate
                            </button>
                            <button
                                onClick={() => setShowCreateTask(true)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                            >
                                + New Task
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Task Input */}
                <div className="mb-8 relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg className={`w-5 h-5 ${isParsingQuickTask ? 'text-purple-500 animate-spin' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={quickTaskText}
                        onChange={(e) => setQuickTaskText(e.target.value)}
                        onKeyDown={handleQuickTask}
                        disabled={isParsingQuickTask}
                        placeholder="Quick AI Task: type something like 'Fix the header styling' and press Enter..."
                        className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-lg"
                    />
                    {!isParsingQuickTask && quickTaskText && (
                        <div className="absolute right-4 top-4 text-[10px] text-slate-500 font-mono">
                            PRESS ENTER TO MAGICALLY CREATE
                        </div>
                    )}
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STATUSES.map((status) => (
                        <div key={status.id} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                                    <h3 className="font-semibold text-white">{status.label}</h3>
                                </div>
                                <span className="text-slate-400 text-sm">{tasksByStatus[status.id]?.length || 0}</span>
                            </div>

                            <div className="space-y-3">
                                {tasksByStatus[status.id]?.map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4 hover:bg-white/20 transition cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs text-slate-400 font-mono">
                                                {project.key}-{task.taskNumber}
                                            </span>
                                            <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                                                {status.id !== 'TODO' && (
                                                    <button
                                                        onClick={() => {
                                                            const currentIndex = STATUSES.findIndex(s => s.id === status.id);
                                                            if (currentIndex > 0) {
                                                                updateTaskStatus(task.id, STATUSES[currentIndex - 1].id);
                                                            }
                                                        }}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                        title="Move left"
                                                    >
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {status.id !== 'DONE' && (
                                                    <button
                                                        onClick={() => {
                                                            const currentIndex = STATUSES.findIndex(s => s.id === status.id);
                                                            if (currentIndex < STATUSES.length - 1) {
                                                                updateTaskStatus(task.id, STATUSES[currentIndex + 1].id);
                                                            }
                                                        }}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                        title="Move right"
                                                    >
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="p-1 hover:bg-red-500/20 rounded"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="text-white font-medium mb-2 line-clamp-2">{task.title}</h4>
                                        {task.description && (
                                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs ${PRIORITIES.find(p => p.id === task.priority)?.color}`}>
                                                {PRIORITIES.find(p => p.id === task.priority)?.label}
                                            </span>
                                            {task.assignee && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">
                                                        {task.assignee.fullName.charAt(0)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {tasksByStatus[status.id]?.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-2xl border border-white/20 p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-white mb-6">Create New Task</h3>
                        <form onSubmit={createTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Fix login bug"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Describe the task..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {PRIORITIES.map((priority) => (
                                        <option key={priority.id} value={priority.id} className="bg-slate-900">
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2">
                                    Initial Status
                                </label>
                                <select
                                    value={newTask.status}
                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {STATUSES.map((status) => (
                                        <option key={status.id} value={status.id} className="bg-slate-900">
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateTask(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Generate Modal */}
            {showAIGenerate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-2xl border border-white/20 p-8 max-w-lg w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white">AI Task Generator</h3>
                        </div>
                        <p className="text-slate-300 mb-6">
                            Describe what you want to achieve, and our AI will break it down into actionable tasks for you.
                        </p>
                        <div className="space-y-4">
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g. Build a secure user authentication system with password reset and MFA..."
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowAIGenerate(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={generateWithAI}
                                    disabled={isGenerating || !aiPrompt}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate Tasks'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Real-time Project Chat */}
            <ProjectChat
                projectId={params.id}
                user={user}
                socket={socket}
            />
        </div>
    );
}
