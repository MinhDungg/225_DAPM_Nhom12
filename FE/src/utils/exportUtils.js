const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5163';

export const downloadFile = async (url, filename) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Xuất file thất bại');
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Hội đồng
export const exportHoiDongExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/excel${maDot ? `?maDot=${maDot}` : ''}`,
        `HoiDong_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportHoiDongPdf = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/pdf${maDot ? `?maDot=${maDot}` : ''}`,
        `HoiDong_${new Date().toISOString().slice(0, 10)}.pdf`);

// Khoa
export const exportKhoaExcel = () =>
    downloadFile(`${API_BASE}/api/export/khoa/excel`,
        `Khoa_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportKhoaPdf = () =>
    downloadFile(`${API_BASE}/api/export/khoa/pdf`,
        `Khoa_${new Date().toISOString().slice(0, 10)}.pdf`);

// Tài chính
export const exportTaiChinhExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/taichinh/excel/${maDot}`,
        `TaiChinh_${maDot}_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportTaiChinhPdf = (maDot) =>
    downloadFile(`${API_BASE}/api/export/taichinh/pdf/${maDot}`,
        `TaiChinh_${maDot}_${new Date().toISOString().slice(0, 10)}.pdf`);
