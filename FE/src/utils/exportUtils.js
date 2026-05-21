const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5163';

// Download binary file (Excel)
export const downloadFile = async (url, fallbackFilename) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    // Parse filename from Content-Disposition if available
    let filename = fallbackFilename;
    const disposition = res.headers.get('Content-Disposition');
    if (disposition && disposition.indexOf('filename=') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
            // Xóa tiền tố utf-8'' nếu có
            if (filename.startsWith('utf-8')) {
                filename = decodeURIComponent(filename.substring(7));
            } else if (filename.startsWith('UTF-8')) {
                filename = decodeURIComponent(filename.substring(7));
            }
        }
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
// Mở tab TRƯỚC khi fetch để tránh popup blocker (window.open sau await bị chặn)
export const openHtml = async (url) => {
    // Mở tab ngay lập tức trong user gesture context
    const newTab = window.open('', '_blank');
    if (!newTab) {
        alert('Trình duyệt đã chặn popup. Vui lòng cho phép popup cho trang này và thử lại.');
        return;
    }
    newTab.document.write('<html><body style="font-family:sans-serif;padding:20px">⏳ Đang tải dữ liệu...</body></html>');

    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const errText = await res.text();
            newTab.close();
            throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        const html = await res.text();
        // Ghi nội dung vào tab đã mở
        newTab.document.open();
        newTab.document.write(html);
        newTab.document.close();
    } catch (err) {
        newTab.close();
        throw err;
    }
};

// ── Hội đồng ──────────────────────────────────────────────────────
export const exportHoiDongExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/excel${maDot ? `?maDot=${maDot}` : ''}`,
        `HoiDong_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportHoiDongPdf = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/pdf${maDot ? `?maDot=${maDot}` : ''}`,
        `HoiDong_${new Date().toISOString().slice(0, 10)}.pdf`);

// ── Khoa ──────────────────────────────────────────────────────────
export const exportKhoaExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/khoa/excel${maDot ? `?maDot=${maDot}` : ''}`,
        `Khoa_${new Date().toISOString().slice(0, 10)}.xlsx`);
export const exportKhoaPdf = (maDot) =>
    downloadFile(`${API_BASE}/api/export/khoa/pdf${maDot ? `?maDot=${maDot}` : ''}`,
        `Khoa_${new Date().toISOString().slice(0, 10)}.pdf`);

// ── Tài chính ─────────────────────────────────────────────────────
export const exportTaiChinhExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/taichinh/excel/${maDot}`,
        `TaiChinh_${maDot}_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportTaiChinhPdf = (maDot) =>
    downloadFile(`${API_BASE}/api/export/taichinh/pdf/${maDot}`,
        `TaiChinh_${maDot}_${new Date().toISOString().slice(0, 10)}.pdf`);

// ── CTSV (cùng endpoint HoiDong, tên file khác) ───────────────────
export const exportCTSVExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/excel${maDot ? `?maDot=${maDot}` : ''}`,
        `CTSV_DanhSach_${new Date().toISOString().slice(0, 10)}.xlsx`);

export const exportCTSVPdf = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/pdf${maDot ? `?maDot=${maDot}` : ''}`,
        `CTSV_DanhSach_${new Date().toISOString().slice(0, 10)}.pdf`);
