import axios from 'axios';

// Sử dụng HTTP thay vì HTTPS để tránh lỗi SSL
const API_BASE_URL = 'http://localhost:5163/api';

// Tạo axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json'
    }
});

const khoaService = {
    // Task 2.1: Lấy danh sách hồ sơ chờ duyệt
    layDanhSachChoDuyet: async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axiosInstance.get('/khoa/danhsach', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chờ duyệt:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Lỗi từ server');
            } else if (error.request) {
                throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra Backend đang chạy.');
            } else {
                throw new Error('Lỗi không xác định');
            }
        }
    },

    layDanhSachChoDuyetTheoDot: async (maDot) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axiosInstance.get(`/khoa/danhsach/${maDot}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chờ duyệt theo đợt:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Lỗi từ server');
            } else if (error.request) {
                throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra Backend đang chạy.');
            } else {
                throw new Error('Lỗi không xác định');
            }
        }
    },

    // Task 2.2: Xếp hạng và phân bổ học bổng
    xepHangVaPhanBo: async (maDot, nganSach) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axiosInstance.post(
                '/khoa/xephang',
                { maDot, nganSach },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi xếp hạng:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Lỗi từ server');
            } else if (error.request) {
                throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra Backend đang chạy.');
            } else {
                throw new Error('Lỗi không xác định');
            }
        }
    },

    // Task 2.3: Chốt danh sách đề xuất
    chotDanhSachDeXuat: async (maDot, danhSachDeXuat) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axiosInstance.put(
                '/khoa/dexuat',
                { maDot, danhSachDeXuat },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi chốt danh sách:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Lỗi từ server');
            } else if (error.request) {
                throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra Backend đang chạy.');
            } else {
                throw new Error('Lỗi không xác định');
            }
        }
    },

    // Lấy danh sách đã đề xuất
    layDanhSachDaDeXuat: async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axiosInstance.get('/khoa/danhsach-da-de-xuat', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đã đề xuất:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Lỗi từ server');
            } else if (error.request) {
                throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra Backend đang chạy.');
            } else {
                throw new Error('Lỗi không xác định');
            }
        }
    }
};

export default khoaService;
