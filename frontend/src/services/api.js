import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Axios instance oluştur
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - token ekle
api.interceptors.request.use(
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

// Response interceptor - hata yönetimi
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth servisleri
export const authService = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me')
};

// Todo servisleri
export const todoService = {
    getAll: () => api.get('/todos'),
    create: (todoData) => api.post('/todos', todoData),
    update: (id, todoData) => api.put(`/todos/${id}`, todoData),
    delete: (id) => api.delete(`/todos/${id}`)
};

export default api; 