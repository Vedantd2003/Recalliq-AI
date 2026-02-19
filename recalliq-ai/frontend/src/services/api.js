import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send cookies
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh endpoint (sends cookie automatically)
        const { data } = await api.post('/auth/refresh');
        const { accessToken: newAccessToken } = data.data;

        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        setAccessToken(null);
        // Let the store handle redirection via state change or event?
        // For now, simpler to redirect or rely on store to notice 401 failure
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  // refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }), // No longer needed manually
  refresh: () => api.post('/auth/refresh'),
};

// Meetings
export const meetingsAPI = {
  analyze: (data) => api.post('/meetings', data),
  getAll: (params) => api.get('/meetings', { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  delete: (id) => api.delete(`/meetings/${id}`),
  updateActionItem: (meetingId, itemId, data) =>
    api.patch(`/meetings/${meetingId}/action-items/${itemId}`, data),
  regenerateEmail: (id) => api.post(`/meetings/${id}/regenerate-email`),
  getStats: () => api.get('/meetings/stats'),
};

// Usage
export const usageAPI = {
  getHistory: (params) => api.get('/usage', { params }),
  getCredits: () => api.get('/usage/credits'),
};

// Users
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
};

export default api;
