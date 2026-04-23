// src/services/finalDecisionService.js
import api from '../utils/api'; // Đảm bảo import đúng file axios config của bạn

const FinalDecisionService = {
    // ==========================================================
    // DÀNH CHO CTSV & HỘI ĐỒNG
    // ==========================================================

    // Lấy danh sách tổng hợp toàn trường (từ các Khoa đề xuất lên)
    getTongHopToanTruong: async () => {
        const response = await api.get('/api/ctsv/tonghop');
        return response.data;
    },

    // Hội đồng duyệt danh sách
    hoiDongXetChon: async (profileIds) => {
        const response = await api.put('/api/hoidong/xetchon', profileIds);
        return response.data;
    },

    // CTSV khóa danh sách và nộp Tờ trình lên BGH
    trinhHieuTruong: async (maDot) => {
        const response = await api.put(`/api/ctsv/trinh-hieu-truong/${maDot}`);
        return response.data;
    },


    // ==========================================================
    // DÀNH CHO HIỆU TRƯỞNG (BAN GIÁM HIỆU)
    // ==========================================================

    // Xem Tờ trình (Chỉ lấy được khi CTSV đã Trình lên)
    getToTrinhHieuTruong: async (maDot) => {
        const response = await api.get(`/api/hieutruong/tong-hop/${maDot}`);
        return response.data;
    },

    // Ký phê duyệt (Chốt danh sách chính thức)
    pheDuyetCaDot: async (maDot) => {
        const response = await api.put(`/api/hieutruong/pheduyet/${maDot}`);
        return response.data;
    },

    // Hiệu trưởng trả hồ sơ kèm lý do
    traHoSo: async (maDot, lyDo) => {
        const response = await api.put(`/api/hieutruong/tra-ho-so/${maDot}`, JSON.stringify(lyDo), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    // ==========================================================
    // DÀNH CHO CTSV - QUẢN LÝ HỒ SƠ
    // ==========================================================

    // Xóa hồ sơ
    xoaHoSo: async (maHoSo) => {
        const response = await api.delete(`/api/ctsv/ho-so/${maHoSo}`);
        return response.data;
    },

    // Lấy danh sách đợt học bổng
    layDsDotHocBong: async () => {
        const response = await api.get('/api/dothocbong');
        return response.data;
    },


    // ==========================================================
    // DÀNH CHO SINH VIÊN
    // ==========================================================

    // Tra cứu trạng thái hồ sơ của cá nhân
    traCuuTienDo: async () => {
        const response = await api.get('/api/sinhvien/tracuu');
        return response.data;
    }
};

export default FinalDecisionService;
