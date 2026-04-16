import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5163', // Sửa lại thành 5163 (HTTP) để tránh lỗi HTTPS không tin cậy ở localhost
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Thêm interceptor nếu cần (như thêm token vào header request)
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

export default api;
