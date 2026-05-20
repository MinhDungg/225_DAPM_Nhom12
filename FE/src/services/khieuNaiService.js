import api from '../utils/api';

const KhieuNaiService = {
    // ================= DÀNH CHO SINH VIÊN =================
    guiKhieuNai: async (data) => {
        // data: { maHoSo, noiDung, minhChung }
        try {
            const response = await api.post('/api/KhieuNai/gui-khieu-nai', data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/login';
                return { success: false, message: 'Chưa đăng nhập' };
            }
            throw error;
        }
    },

    layKhieuNaiSinhVien: async () => {
        try {
            const response = await api.get('/api/KhieuNai/sinh-vien');
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                console.warn('Chưa đăng nhập hoặc token hết hạn.');
                return { success: false, message: 'Chưa đăng nhập', data: [] };
            }
            if (error.response?.status === 403) {
                console.warn('Không có quyền truy cập trang này.');
                return { success: false, message: 'Không có quyền', data: [] };
            }
            throw error;
        }
    },

    // ================= DÀNH CHO CÁN BỘ / CTSV =================
    layTatCaKhieuNai: async () => {
        try {
            const response = await api.get('/api/KhieuNai/tat-ca');
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                console.warn('Chưa đăng nhập hoặc token hết hạn.');
                return { success: false, message: 'Chưa đăng nhập', data: [] };
            }
            if (error.response?.status === 403) {
                console.warn('Không có quyền truy cập.');
                return { success: false, message: 'Không có quyền', data: [] };
            }
            throw error;
        }
    },

    phanHoiKhieuNai: async (id, data) => {
        // data: { noiDungPhanHoi }
        try {
            const response = await api.put(`/api/KhieuNai/${id}/phan-hoi`, data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/login';
                return { success: false, message: 'Chưa đăng nhập' };
            }
            throw error;
        }
    },

    uploadMinhChung: async (file, onUploadProgress) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/api/KhieuNai/upload-minh-chung', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000, // 60s riêng cho upload file - tránh timeout khi mạng chậm
                onUploadProgress: (progressEvent) => {
                    if (onUploadProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onUploadProgress(percentCompleted);
                    }
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi tải tệp lên:', error);
            throw error;
        }
    }
};

export default KhieuNaiService;