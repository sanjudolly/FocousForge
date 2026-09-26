import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  onboarding: (data: Record<string, unknown>) => api.post('/auth/onboarding', data),
  updateProfile: (data: Record<string, unknown>) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};

// Goals
export const goalsAPI = {
  getDashboard: () => api.get('/goals/dashboard'),
  getGoals: (params?: Record<string, unknown>) => api.get('/goals', { params }),
  getGoal: (id: string) => api.get(`/goals/${id}`),
  createGoal: (data: Record<string, unknown>) => api.post('/goals', data),
  updateGoal: (id: string, data: Record<string, unknown>) => api.put(`/goals/${id}`, data),
  deleteGoal: (id: string) => api.delete(`/goals/${id}`),
  completeGoal: (id: string) => api.post(`/goals/${id}/complete`),
};

// Proof
export const proofAPI = {
  getProofs: (params?: Record<string, unknown>) => api.get('/proof', { params }),
  submitProof: (data: FormData) =>
    api.post('/proof', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verifyProof: (id: string, data: { status: string; rejectionReason?: string }) =>
    api.put(`/proof/${id}/verify`, data),
};

// Analytics
export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
};

// Notifications
export const notificationsAPI = {
  getNotifications: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// Achievements
export const achievementsAPI = {
  getAchievements: () => api.get('/achievements'),
};

// Stripe
export const stripeAPI = {
  createPaymentIntent: (data: { amount: number; goalId: string; goalTitle: string }) =>
    api.post('/stripe/payment-intent', data),
  getTransactions: () => api.get('/stripe/transactions'),
};

// Commitments (Pocket Money system)
export const commitmentAPI = {
  getCharities: () => api.get('/commitments/charities'),
  getDashboard: () => api.get('/commitments/dashboard'),
  getCommitments: (params?: Record<string, unknown>) => api.get('/commitments', { params }),
  getCommitment: (id: string) => api.get(`/commitments/${id}`),
  createCommitment: (data: Record<string, unknown>) => api.post('/commitments', data),
  deleteCommitment: (id: string) => api.delete(`/commitments/${id}`),
  completeTask: (id: string, taskId: string) => api.put(`/commitments/${id}/task/${taskId}`),
  submitProof: (id: string, data: FormData) =>
    api.post(`/commitments/${id}/proof`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verifyProof: (id: string, data: { status: string; rejectionReason?: string }) =>
    api.put(`/commitments/${id}/proof/verify`, data),
  checkEligibility: (id: string) => api.get(`/commitments/${id}/eligibility`),
  claim: (id: string) => api.post(`/commitments/${id}/claim`),
  getTimeline: (id: string) => api.get(`/commitments/${id}/timeline`),
};
