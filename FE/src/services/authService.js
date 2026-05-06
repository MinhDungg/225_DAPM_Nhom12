import axios from 'axios';

const API_BASE_URL = 'http://localhost:5163/api';

const authService = {
    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username,
                password
            });
            
            if (response.data.success) {
                // Lưu token vào localStorage
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('role', response.data.data.role);
                localStorage.setItem('userInfo', JSON.stringify(response.data.data.userInfo));
                
                return response.data;
            }
            
            return null;
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            throw error;
        }
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userInfo');
    },
    
    getToken: () => {
        return localStorage.getItem('token');
    },
    
    getRole: () => {
        return localStorage.getItem('role');
    },
    
    getUserInfo: () => {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default authService;
