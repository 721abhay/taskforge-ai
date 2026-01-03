import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl: string | null;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { user, tokens } = response.data.data;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', tokens.accessToken);
                        localStorage.setItem('refreshToken', tokens.refreshToken);
                    }

                    set({
                        user,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({ isLoading: false });
                    throw new Error(error.response?.data?.message || 'Login failed');
                }
            },

            register: async (email: string, password: string, fullName: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/register', {
                        email,
                        password,
                        fullName,
                    });
                    const { user, tokens } = response.data.data;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', tokens.accessToken);
                        localStorage.setItem('refreshToken', tokens.refreshToken);
                    }

                    set({
                        user,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({ isLoading: false });
                    throw new Error(error.response?.data?.message || 'Registration failed');
                }
            },

            logout: () => {
                const { refreshToken } = get();
                if (refreshToken) {
                    api.post('/auth/logout', { refreshToken }).catch(() => { });
                }

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }

                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            setUser: (user: User) => {
                set({ user, isAuthenticated: true });
            },

            fetchUser: async () => {
                try {
                    const response = await api.get('/auth/me');
                    set({ user: response.data.data.user, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { },
            } as any))),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
