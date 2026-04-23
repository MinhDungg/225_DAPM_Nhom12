import api from '../utils/api.js';

const dotHocBongService = {
  /** POST /api/dothocbong */
  createDotHocBong: async (data) => {
    const response = await api.post('/api/dothocbong', data);
    return response.data;
  },

  /** GET /api/dothocbong */
  getDanhSachDot: async () => {
    const response = await api.get('/api/dothocbong');
    return response.data;
  },

  /** PUT /api/dothocbong/:maDot */
  updateDotHocBong: async (maDot, data) => {
    const response = await api.put(`/api/dothocbong/${maDot}`, data);
    return response.data;
  },

  /** DELETE /api/dothocbong/:maDot */
  deleteDotHocBong: async (maDot) => {
    const response = await api.delete(`/api/dothocbong/${maDot}`);
    return response.data;
  },

  /** POST /api/dothocbong/:maDot/tu-dong-quet */
  tuDongQuet: async (maDot) => {
    const response = await api.post(`/api/dothocbong/${maDot}/tu-dong-quet`);
    return response.data;
  },

  /** GET /api/dothocbong/:maDot/danh-sach-ung-vien */
  getDanhSachUngVien: async (maDot) => {
    const response = await api.get(`/api/dothocbong/${maDot}/danh-sach-ung-vien`);
    return response.data;
  },
};

export default dotHocBongService;
