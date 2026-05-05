import api from '../utils/api.js';

const sinhVienService = {
  /**
   * Xác thực danh sách mã sinh viên, trả về [{ maSV, hoTen }] cho các mã hợp lệ.
   * POST /api/sinhvien/verify-list
   * @param {string[]} maSVs
   * @returns {Promise<{ success: boolean, data: Array<{ maSV: string, hoTen: string }> }>}
   */
  verifyList: async (maSVs) => {
    const response = await api.post('/api/sinhvien/verify-list', maSVs);
    return response.data;
  },
};

export default sinhVienService;
