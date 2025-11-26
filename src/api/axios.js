import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Ajusta si tu prefijo cambia
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar el token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;