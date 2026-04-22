import api from '../utils/api.js';

const dotHocBongService = {
  /**
   * Tạo đợt học bổng mới.
   * POST /api/dothocbong
   * @param {{ loaiDot: string, hocKy: number, namHoc: string }} data
   */
  createDotHocBong: async (data) => {
    const response = await api.post('/api/dothocbong', data);
    return response.data;
  },

  /**
   * Lấy danh sách tất cả đợt học bổng.
   * GET /api/dothocbong
   */
  getDanhSachDot: async () => {
    const response = await api.get('/api/dothocbong');
    return response.data;
  },
};

export default dotHocBongService;
