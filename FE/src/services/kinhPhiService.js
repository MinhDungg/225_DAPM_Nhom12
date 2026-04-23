import api from '../utils/api.js';

const kinhPhiService = {
  /**
   * Lấy danh sách đợt học bổng dành cho KHTC.
   * GET /api/dothocbong — lọc DangXetDuyet hoặc DuKien ở client.
   */
  getDotHocBongKHTC: async () => {
    const response = await api.get('/api/dothocbong');
    const res = response.data;
    if (res.success && Array.isArray(res.data)) {
      return {
        ...res,
        data: res.data.filter(
          d => d.trangThai === 'DangXetDuyet' || d.trangThai === 'DuKien'
        ),
      };
    }
    return res;
  },

  /**
   * Lấy danh sách tất cả Khoa.
   * GET /api/khoa
   */
  getDanhSachKhoa: async () => {
    const response = await api.get('/api/khoa');
    return response.data;
  },

  /**
   * Thiết lập kinh phí cho nhiều Khoa trong một đợt.
   * POST /api/khtc/thiet-lap-kinh-phi-bulk
   * @param {Array<{ maDot, maKhoa, kinhPhi, mucHBLoaiKha }>} payload
   */
  thietLapKinhPhi: async (payload) => {
    const response = await api.post('/api/khtc/thiet-lap-kinh-phi-bulk', payload);
    return response.data;
  },
};

export default kinhPhiService;
