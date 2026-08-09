import { create } from 'zustand';
import { User, Role } from '../types';
import { apiRequest } from '../lib/api';
import { reconnectSocketWithToken } from '../lib/socket';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: Role, phone?: string) => Promise<boolean>;
  demoLogin: (role: Role) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('crisis_access_token'),
  isAuthenticated: !!localStorage.getItem('crisis_access_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const res = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      localStorage.setItem('crisis_access_token', res.data.accessToken);
      reconnectSocketWithToken(res.data.accessToken);
      set({
        user: res.data.user,
        accessToken: res.data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } else {
      set({ error: res.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  register: async (name, email, password, role = 'citizen', phone) => {
    set({ isLoading: true, error: null });
    const res = await apiRequest<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, phone }),
    });

    if (res.success && res.data) {
      localStorage.setItem('crisis_access_token', res.data.accessToken);
      reconnectSocketWithToken(res.data.accessToken);
      set({
        user: res.data.user,
        accessToken: res.data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } else {
      set({ error: res.message || 'Registration failed', isLoading: false });
      return false;
    }
  },

  demoLogin: async (role: Role) => {
    let email = 'citizen.john@demo.com';
    let password = 'Demo@123';

    if (role === 'admin') {
      email = 'admin@demo.com';
      password = 'Admin@123';
    } else if (role === 'responder') {
      email = 'officer.marcus@demo.com';
      password = 'Demo@123';
    } else if (role === 'hospital') {
      email = 'stjude.hospital@demo.com';
      password = 'Demo@123';
    }

    return await get().login(email, password);
  },

  logout: () => {
    localStorage.removeItem('crisis_access_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('crisis_access_token');
    if (!token) return;

    set({ isLoading: true });
    const res = await apiRequest<User>('/auth/me');
    if (res.success && res.data) {
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } else {
      localStorage.removeItem('crisis_access_token');
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true });
    const res = await apiRequest<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (res.success && res.data) {
      set({ user: res.data, isLoading: false });
      return true;
    } else {
      set({ isLoading: false, error: res.message || 'Update failed' });
      return false;
    }
  },
}));
