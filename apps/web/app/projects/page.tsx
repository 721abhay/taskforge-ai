'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string | null;
    key: string;
    status: string;
    _count: {
        tasks: number;
    };
    members: any[];
}

export default function ProjectsPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        key: '',
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchProjects();
    }, [isAuthenticated]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('http://localhost:5002/projects');
            setProjects(response.data.data.projects);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            await api.post('http://localhost:5002/projects', newProject);
            setShowCreateModal(false);
            setNewProject({ name: '', description: '', key: '' });
            fetchProjects();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

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
                            <Link href="/projects" className="text-purple-400 font-medium">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Projects</h2>
                        <p className="text-slate-300 mt-2">Manage your projects and tasks</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                    >
                        + New Project
                    </button>
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="text-center text-white py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4">Loading projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center">
                        <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                        <p className="text-slate-300 mb-6">Create your first project to get started</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                        >
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/20 transition cursor-pointer">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{project.name}</h3>
                                            <p className="text-purple-400 text-sm font-mono">{project.key}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-200 rounded-full text-xs">
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                                        {project.description || 'No description'}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-slate-400">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            {project._count.tasks} tasks
                                        </div>
                                        <div className="flex items-center text-slate-400">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            {project.members.length} members
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-2xl border border-white/20 p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-white mb-6">Create New Project</h3>
                        <form onSubmit={createProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="My Awesome Project"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2">
                                    Project Key (2-10 uppercase letters/numbers)
                                </label>
                                <input
                                    type="text"
                                    value={newProject.key}
                                    onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })}
                                    required
                                    pattern="[A-Z0-9]{2,10}"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="PROJ"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="What is this project about?"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
