import { create } from 'zustand';
import { authAPI, setAccessToken } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      // Try to get a new access token using the HttpOnly cookie
      const { data } = await authAPI.refresh();
      const { accessToken } = data.data;

      setAccessToken(accessToken);

      // Then get user details
      const userRes = await authAPI.getMe();
      set({ user: userRes.data.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      setAccessToken(null);
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const { user, accessToken } = data.data;

    setAccessToken(accessToken);
    set({ user, isAuthenticated: true });
    return user;
  },

  register: async (formData) => {
    const { data } = await authAPI.register(formData);
    const { user, accessToken } = data.data;

    setAccessToken(accessToken);
    set({ user, isAuthenticated: true });
    return user;
  },

  logout: async () => {
    try { await authAPI.logout(); } catch { }
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }));
  },

  deductCredits: (amount) => {
    set((state) => ({
      user: { ...state.user, credits: Math.max(0, (state.user?.credits || 0) - amount) },
    }));
  },
}));

export default useAuthStore;
