import api from '../utils/api.js';

const diemService = {
  /**
   * Import dữ liệu học vụ gộp (GPA + DRL) từ Frontend.
   * POST /api/diem/import-du-lieu-hoc-vu
   * @param {Array<{
   *   maSV: string, hocKy: number, namHoc: string,
   *   gPA: number, diemHocTap: number, soTC: number,
   *   coDiemF: boolean, diemSoDRL: number
   * }>} danhSach
   */
  importDuLieuHocVu: async (danhSach) => {
    const response = await api.post('/api/diem/import-du-lieu-hoc-vu', danhSach);
    return response.data;
  },
};

export default diemService;
