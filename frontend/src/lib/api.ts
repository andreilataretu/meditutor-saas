import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (email: string, password: string, fullName: string) =>
    apiClient.post('/auth/register', { email, password, fullName }),
};

// Clients API
export const clientsAPI = {
  getAll: () => apiClient.get('/clients'),
  getOne: (id: string) => apiClient.get(`/clients/${id}`),
  create: (data: any) => apiClient.post('/clients', data),
  update: (id: string, data: any) => apiClient.put(`/clients/${id}`, data),
  delete: (id: string) => apiClient.delete(`/clients/${id}`),
  getStats: (id: string) => apiClient.get(`/clients/${id}/stats`),
};

// Sessions API
export const sessionsAPI = {
  getAll: (params?: any) => apiClient.get('/sessions', { params }),
  getOne: (id: string) => apiClient.get(`/sessions/${id}`),
  create: (data: any) => apiClient.post('/sessions', data),
  update: (id: string, data: any) => apiClient.put(`/sessions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sessions/${id}`),
  markPaid: (id: string) => apiClient.patch(`/sessions/${id}/mark-paid`),
};

// Notes API
export const notesAPI = {
  getForClient: (clientId: string) => apiClient.get(`/notes/client/${clientId}`),
  create: (data: any) => apiClient.post('/notes', data),
  update: (id: string, data: any) => apiClient.put(`/notes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/notes/${id}`),
};

// Grades API
export const gradesAPI = {
  getForClient: (clientId: string) => apiClient.get(`/grades/client/${clientId}`),
  create: (data: any) => apiClient.post('/grades', data),
  update: (id: string, data: any) => apiClient.put(`/grades/${id}`, data),
  delete: (id: string) => apiClient.delete(`/grades/${id}`),
};

// Objectives API
export const objectivesAPI = {
  getForClient: (clientId: string) => apiClient.get(`/objectives/client/${clientId}`),
  create: (data: any) => apiClient.post('/objectives', data),
  update: (id: string, data: any) => apiClient.put(`/objectives/${id}`, data),
  delete: (id: string) => apiClient.delete(`/objectives/${id}`),
};

// Journals API
export const journalsAPI = {
  getForSession: (sessionId: string) => apiClient.get(`/journals/session/${sessionId}`),
  save: (data: any) => apiClient.post('/journals', data),
  delete: (id: string) => apiClient.delete(`/journals/${id}`),
};

// Materials API
export const materialsAPI = {
  getAll: (params?: any) => apiClient.get('/materials', { params }),
  getOne: (id: string) => apiClient.get(`/materials/${id}`),
  create: (formData: FormData) =>
    apiClient.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: any) => apiClient.put(`/materials/${id}`, data),
  delete: (id: string) => apiClient.delete(`/materials/${id}`),
  download: (id: string) => apiClient.get(`/materials/${id}/download`, { responseType: 'blob' }),
};

// Stats API
export const statsAPI = {
  getDashboard: () => apiClient.get('/stats/dashboard'),
  getFinancial: (months?: number) => apiClient.get('/stats/financial', { params: { months } }),
  getClientsActivity: () => apiClient.get('/stats/clients-activity'),
  getMonthlySummary: (year: number, month: number) =>
    apiClient.get('/stats/monthly-summary', { params: { year, month } }),
};
