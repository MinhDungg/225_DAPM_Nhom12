import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Download, Upload, CheckCircle, Loader2, FileSpreadsheet, X } from 'lucide-react';
import diemService from '../../services/diemService.js';

// Tên cột Excel khớp với ImportHocVuRequest DTO (Backend)
const EXCEL_HEADERS = [
  'MaSV', 'HocKy', 'NamHoc', 'GPA', 'DiemHocTap', 'SoTC', 'CoDiemF', 'DiemSoDRL',
];

// Map tên cột Excel → tên field DTO (camelCase cho JSON)
const HEADER_MAP = {
  MaSV: 'maSV',
  HocKy: 'hocKy',
  NamHoc: 'namHoc',
  GPA: 'gPA',
  DiemHocTap: 'diemHocTap',
  SoTC: 'soTC',
  CoDiemF: 'coDiemF',
  DiemSoDRL: 'diemSoDRL',
};

const DaoTaoImport = () => {
  const fileInputRef = useRef(null);
  const [danhSachPreview, setDanhSachPreview] = useState([]);
  const [tenFile, setTenFile] = useState('');
  const [dangGui, setDangGui] = useState(false);

  // ─── Tải file mẫu ────────────────────────────────────────────────────────────
  const taiFileMau = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS]);

    // Đặt độ rộng cột
    ws['!cols'] = EXCEL_HEADERS.map(() => ({ wch: 16 }));

    XLSX.utils.book_append_sheet(wb, ws, 'DuLieuHocVu');
    XLSX.writeFile(wb, 'mau_import_hoc_vu.xlsx');
    toast.info('Đã tải file mẫu thành công.');
  };

  // ─── Đọc & parse file Excel ───────────────────────────────────────────────────
  const xuLyChonFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTenFile(file.name);
    setDanhSachPreview([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // header: 1 → trả về mảng mảng; defval: '' để không bị undefined
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rows.length < 2) {
          toast.warning('File không có dữ liệu (chỉ có header hoặc rỗng).');
          return;
        }

        const headers = rows[0].map((h) => String(h).trim());
        const dataRows = rows.slice(1).filter((row) =>
          row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
        );

        const parsed = dataRows.map((row) => {
          const obj = {};
          headers.forEach((header, idx) => {
            const dtoKey = HEADER_MAP[header];
            if (!dtoKey) return;

            let val = row[idx];

            // Ép kiểu đúng theo DTO
            if (header === 'HocKy' || header === 'SoTC' || header === 'DiemSoDRL') {
              val = parseInt(val, 10) || 0;
            } else if (header === 'GPA' || header === 'DiemHocTap') {
              val = parseFloat(val) || 0;
            } else if (header === 'CoDiemF') {
              // Chấp nhận: true/false, 1/0, "true"/"false", "1"/"0", "có"/"không"
              val =
                val === true ||
                val === 1 ||
                String(val).toLowerCase() === 'true' ||
                String(val).toLowerCase() === '1' ||
                String(val).toLowerCase() === 'có';
            } else {
              val = String(val).trim();
            }

            obj[dtoKey] = val;
          });
          return obj;
        });

        if (parsed.length === 0) {
          toast.warning('Không tìm thấy dòng dữ liệu hợp lệ trong file.');
          return;
        }

        setDanhSachPreview(parsed);
        toast.success(`Đọc file thành công: ${parsed.length} bản ghi.`);
      } catch (err) {
        toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset input để có thể chọn lại cùng file
    e.target.value = '';
  };

  const xoaFile = () => {
    setDanhSachPreview([]);
    setTenFile('');
  };

  // ─── Gửi dữ liệu lên Backend ─────────────────────────────────────────────────
  const xuLyImport = async () => {
    if (danhSachPreview.length === 0) {
      toast.warning('Chưa có dữ liệu để import. Vui lòng chọn file trước.');
      return;
    }

    setDangGui(true);
    try {
      const res = await diemService.importDuLieuHocVu(danhSachPreview);

      if (res.success) {
        const { thanhCong, thatBai, danhSachLoi } = res.data || {};
        toast.success(
          `Import thành công: ${thanhCong ?? 0} bản ghi. Thất bại: ${thatBai ?? 0}.`
        );
        if (danhSachLoi?.length > 0) {
          toast.warning(`Mã SV không hợp lệ: ${danhSachLoi.join(', ')}`);
        }
        xoaFile();
      } else {
        toast.error(res.message || 'Import thất bại.');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || 'Lỗi hệ thống.';
      toast.error(msg);
    } finally {
      setDangGui(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="bg-green-50 p-2.5 rounded-xl">
          <FileSpreadsheet className="text-green-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Import Dữ Liệu Học Vụ</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tải lên file Excel chứa GPA và điểm rèn luyện của sinh viên
          </p>
        </div>
      </div>

      {/* Action Card */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          {/* Tải file mẫu */}
          <button
            onClick={taiFileMau}
            className="flex items-center gap-2 px-4 py-2.5 border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-semibold transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            Tải file mẫu (.xlsx)
          </button>

          {/* Chọn file */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Chọn file Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={xuLyChonFile}
            className="hidden"
          />
        </div>

        {/* Tên file đã chọn */}
        {tenFile && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-sm text-slate-700 font-medium truncate flex-1">{tenFile}</span>
            <button
              onClick={xoaFile}
              className="text-slate-400 hover:text-red-500 transition shrink-0"
              title="Xóa file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Table */}
      {danhSachPreview.length > 0 && (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 text-sm">
              Xem trước dữ liệu —{' '}
              <span className="text-blue-600">{danhSachPreview.length} bản ghi</span>
            </h2>
            <button
              onClick={xuLyImport}
              disabled={dangGui}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold transition active:scale-95"
            >
              {dangGui ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Xác nhận &amp; Import
                </>
              )}
            </button>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    #
                  </th>
                  {EXCEL_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {danhSachPreview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{idx + 1}</td>
                    {EXCEL_HEADERS.map((h) => {
                      const dtoKey = HEADER_MAP[h];
                      const val = row[dtoKey];
                      return (
                        <td key={h} className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                          {h === 'CoDiemF'
                            ? val
                              ? <span className="text-red-500 font-semibold">Có</span>
                              : <span className="text-green-600 font-semibold">Không</span>
                            : String(val ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaoTaoImport;
