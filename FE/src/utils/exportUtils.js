const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5163';

// Download binary file (Excel)
export const downloadFile = async (url, filename) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Mở HTML trong tab mới để in PDF (thay QuestPDF)
export const openHtml = async (url) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    const html = await res.text();
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
};

// ── Hội đồng ──────────────────────────────────────────────────────
export const exportHoiDongExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/excel${maDot ? `?maDot=${maDot}` : ''}`,
        `HoiDong_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportHoiDongPdf = (maDot) =>
    openHtml(`${API_BASE}/api/export/hoidong/pdf${maDot ? `?maDot=${maDot}` : ''}`);

// ── Khoa ──────────────────────────────────────────────────────────
export const exportKhoaExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/khoa/excel${maDot ? `?maDot=${maDot}` : ''}`,
        `Khoa_${new Date().toISOString().slice(0, 10)}.xlsx`);
export const exportKhoaPdf = (maDot) =>
    openHtml(`${API_BASE}/api/export/khoa/pdf${maDot ? `?maDot=${maDot}` : ''}`);

// ── Tài chính ─────────────────────────────────────────────────────
export const exportTaiChinhExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/taichinh/excel/${maDot}`,
        `TaiChinh_${maDot}_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportTaiChinhPdf = (maDot) =>
    openHtml(`${API_BASE}/api/export/taichinh/pdf/${maDot}`);

// ── CTSV (cùng endpoint HoiDong, tên file khác) ───────────────────
export const exportCTSVExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/excel${maDot ? `?maDot=${maDot}` : ''}`,
        `CTSV_DanhSach_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportCTSVPdf = (maDot) =>
    openHtml(`${API_BASE}/api/export/hoidong/pdf${maDot ? `?maDot=${maDot}` : ''}`);
