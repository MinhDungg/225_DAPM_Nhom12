const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5163";

// Download binary file (Excel hoac PDF) via Blob
export const downloadFile = async (url, fallbackFilename) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    if (!res.ok) { const errText = await res.text(); throw new Error(`HTTP ${res.status}: ${errText}`); }

    let filename = fallbackFilename;
    const disposition = res.headers.get("Content-Disposition");
    if (disposition && disposition.indexOf("filename=") !== -1) {
        const m = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (m && m[1]) {
            filename = m[1].replace(/['"]/g, "");
            if (filename.startsWith("utf-8") || filename.startsWith("UTF-8"))
                filename = decodeURIComponent(filename.substring(7));
        }
    }

    const blob = await res.blob();
    const url2 = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url2; link.download = filename;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url2);
};

// Download PDF truc tiep dang Blob (khong mo tab)
export const downloadPdf = async (url, fallbackFilename) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    if (!res.ok) { const errText = await res.text(); throw new Error(`HTTP ${res.status}: ${errText}`); }

    let filename = fallbackFilename;
    const disposition = res.headers.get("Content-Disposition");
    if (disposition && disposition.indexOf("filename=") !== -1) {
        const m = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (m && m[1]) {
            filename = m[1].replace(/['"]/g, "");
            if (filename.startsWith("utf-8") || filename.startsWith("UTF-8"))
                filename = decodeURIComponent(filename.substring(7));
        }
    }

    const blob = new Blob([await res.arrayBuffer()], { type: "application/pdf" });
    const url2 = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url2; link.download = filename;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url2);
};

// Mo HTML trong tab moi de in PDF (fallback cho endpoint chua dung iText)
export const openHtml = async (url) => {
    const newTab = window.open("", "_blank");
    if (!newTab) { alert("Trinh duyet da chan popup. Vui long cho phep popup va thu lai."); return; }
    newTab.document.write("<html><body style='font-family:sans-serif;padding:20px'>Dang tai du lieu...</body></html>");
    try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) { const errText = await res.text(); newTab.close(); throw new Error(`HTTP ${res.status}: ${errText}`); }
        const html = await res.text();
        newTab.document.open(); newTab.document.write(html); newTab.document.close();
    } catch (err) { newTab.close(); throw err; }
};

// Hoi dong
export const exportHoiDongExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/excel${maDot ? `?maDot=${maDot}` : ""}`,
        `DanhSachHBKK_${new Date().toISOString().slice(0, 10)}.xlsx`);
export const exportHoiDongPdf = (maDot) =>
    downloadPdf(`${API_BASE}/api/export/hoidong/pdf${maDot ? `?maDot=${maDot}` : ""}`,
        `DanhSachHBKK_${new Date().toISOString().slice(0, 10)}.pdf`);

// Khoa
export const exportKhoaExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/khoa/excel${maDot ? `?maDot=${maDot}` : ""}`,
        `DanhSachHBKK_${new Date().toISOString().slice(0, 10)}.xlsx`);
export const exportKhoaPdf = (maDot) =>
    downloadPdf(`${API_BASE}/api/export/khoa/pdf${maDot ? `?maDot=${maDot}` : ""}`,
        `DanhSachHBKK_${new Date().toISOString().slice(0, 10)}.pdf`);

// Tai chinh
export const exportTaiChinhExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/taichinh/excel/${maDot}`,
        `TaiChinh_${maDot}_${new Date().toISOString().slice(0, 10)}.xlsx`);
export const exportTaiChinhPdf = (maDot) =>
    downloadPdf(`${API_BASE}/api/export/taichinh/pdf/${maDot}`,
        `TaiChinh_KinhPhi_${maDot}_${new Date().toISOString().slice(0, 10)}.pdf`);

// CTSV
export const exportCTSVExcel = (maDot) =>
    downloadFile(`${API_BASE}/api/export/hoidong/excel${maDot ? `?maDot=${maDot}` : ""}`,
        `DanhSachHBKK_${new Date().toISOString().slice(0, 10)}.xlsx`);
export const exportCTSVPdf = (maDot) =>
    downloadPdf(`${API_BASE}/api/export/hoidong/pdf${maDot ? `?maDot=${maDot}` : ""}`,
        `DanhSachHBKK_${new Date().toISOString().slice(0, 10)}.pdf`);
