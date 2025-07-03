import axios from 'axios';

const api = axios.create({
    baseURL: 'https://financecontrol-back.onrender.com/api' // A URL base da sua API
});

// Interceptor: Adiciona o token JWT a todas as requisições autenticadas
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
