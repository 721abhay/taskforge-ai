'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface DashboardStats {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    recentProjects: Array<{
        id: string;
        name: string;
        key: string;
        _count: { tasks: number };
    }>;
    projectHealth?: {
        completionRate: number;
        velocity: number;
        predictedFinishDate: string;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        recentProjects: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchDashboardStats();
    }, [isAuthenticated, router]);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('http://localhost:5002/projects');
            const projects = response.data.data.projects;

            let totalTasks = 0;
            let completedTasks = 0;
            let inProgressTasks = 0;

            projects.forEach((project: any) => {
                totalTasks += project._count?.tasks || 0;
                if (project.tasks) {
                    completedTasks += project.tasks.filter((t: any) => t.status === 'DONE').length;
                    inProgressTasks += project.tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
                }
            });

            let projectHealth = undefined;
            if (projects.length > 0) {
                try {
                    const healthRes = await api.get(`http://localhost:4000/api/v1/analytics/project/${projects[0].id}`);
                    projectHealth = healthRes.data.data;
                } catch (e) {
                    console.error('Failed to fetch project health:', e);
                }
            }

            setStats({
                totalProjects: projects.length,
                totalTasks,
                completedTasks,
                inProgressTasks,
                recentProjects: projects.slice(0, 3),
                projectHealth,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    const completionRate = stats.totalTasks > 0
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-2xl font-bold text-white">
                                Task<span className="text-purple-400">Forge</span> AI
                            </h1>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Welcome back, {user.fullName}! 🎉
                    </h2>
                    <p className="text-slate-300 text-lg">
                        Here's what's happening with your projects today.
                    </p>
                </div>

                {/* Stats Grid */}
                {isLoading ? (
                    <div className="text-center text-white py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4">Loading stats...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">Projects</p>
                                        <p className="text-3xl font-bold text-white mt-1">{stats.totalProjects}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">Total Tasks</p>
                                        <p className="text-3xl font-bold text-white mt-1">{stats.totalTasks}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">In Progress</p>
                                        <p className="text-3xl font-bold text-white mt-1">{stats.inProgressTasks}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">Completed</p>
                                        <p className="text-3xl font-bold text-white mt-1">{stats.completedTasks}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Overall Progress</h3>
                                <span className="text-2xl font-bold text-purple-400">{completionRate}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                ></div>
                            </div>
                            <p className="text-slate-400 text-sm mt-2">
                                {stats.completedTasks} of {stats.totalTasks} tasks completed
                            </p>
                        </div>

                        {/* AI Project Health */}
                        {stats.projectHealth && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 flex flex-col justify-between">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">AI Deployment Health</h3>
                                            <p className="text-slate-400 text-sm">Most Recent Project</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-300">Team Velocity</span>
                                            <span className="text-purple-400 font-bold">{stats.projectHealth.velocity} tasks/wk</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-300">AI Predicted Finish</span>
                                            <span className="text-pink-400 font-bold">
                                                {new Date(stats.projectHealth.predictedFinishDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
                                    <h3 className="text-xl font-bold text-white mb-4">Smart Observations</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            </div>
                                            <p className="text-slate-300 text-sm">
                                                Project is <span className="text-green-400 font-bold">on track</span>. Velocity increased by 15% this week.
                                            </p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <p className="text-slate-300 text-sm">
                                                AI recommends adding 2 more tasks to the "High" priority bucket based on trajectory.
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Recent Projects */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-white">Recent Projects</h3>
                                <Link
                                    href="/projects"
                                    className="text-purple-400 hover:text-purple-300 transition text-sm font-medium"
                                >
                                    View All →
                                </Link>
                            </div>

                            {stats.recentProjects.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-400 mb-4">No projects yet</p>
                                    <Link
                                        href="/projects"
                                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                                    >
                                        Create Your First Project
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {stats.recentProjects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={`/projects/${project.id}`}
                                            className="block"
                                        >
                                            <div className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition cursor-pointer border border-white/10">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                            <span className="text-purple-400 font-bold">{project.key}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white font-medium">{project.name}</h4>
                                                            <p className="text-slate-400 text-sm">{project._count.tasks} tasks</p>
                                                        </div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
