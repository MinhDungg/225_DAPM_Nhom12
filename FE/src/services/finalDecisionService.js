import axios from 'axios';

const API_BASE_URL = 'http://localhost:5163/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const finalDecisionService = {
    // Task 3.1: Tổng hợp dữ liệu toàn trường (CTSV / Hội Đồng)
    layTongHopToanTruong: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get('/ctsv/tonghop', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tổng hợp hồ sơ:', error);
            if (error.response) throw new Error(error.response.data.message || 'Lỗi từ server');
            if (error.request) throw new Error('Không kết nối được server.');
            throw new Error('Lỗi không xác định');
        }
    },

    // Task 3.2: Hội đồng chốt danh sách dự kiến
    hoiDongXetChon: async (danhSachMaHoSo) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.put(
                '/hoidong/xetchon',
                danhSachMaHoSo,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi Hội đồng xét chọn:', error);
            if (error.response) throw new Error(error.response.data.message || 'Lỗi từ server');
            if (error.request) throw new Error('Không kết nối được server.');
            throw new Error('Lỗi không xác định');
        }
    }
};

export default finalDecisionService;
