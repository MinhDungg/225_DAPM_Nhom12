import React, { useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import {
  Download, CheckCircle, Loader2, FileSpreadsheet,
  X, UploadCloud, ArrowLeft,
} from 'lucide-react';
import diemService from '../../services/diemService.js';

// ─── Cấu trúc file Excel quy ước mới ─────────────────────────────────────────
// Dòng 1: ["HocKy",  <giá trị>]
// Dòng 2: ["NamHoc", <giá trị>]
// Dòng 3: [] (trống)
// Dòng 4: ["MaSV", "GPA", "DiemHocTap", "SoTC", "CoDiemF", "DiemSoDRL"]  ← header
// Dòng 5+: dữ liệu sinh viên

// Các cột dữ liệu (không gồm HocKy/NamHoc vì đã lấy từ B1/B2)
const DATA_HEADERS = ['MaSV', 'GPA', 'DiemHocTap', 'SoTC', 'CoDiemF', 'DiemSoDRL'];

// Map tên cột → DTO key
const HEADER_MAP = {
  MaSV: 'maSV',
  GPA: 'gPA',
  DiemHocTap: 'diemHocTap',
  SoTC: 'soTC',
  CoDiemF: 'coDiemF',
  DiemSoDRL: 'diemSoDRL',
};

// ─── Helper: ép kiểu từng field ──────────────────────────────────────────────
const epKieu = (header, val) => {
  if (header === 'SoTC' || header === 'DiemSoDRL') return parseInt(val, 10) || 0;
  if (header === 'GPA' || header === 'DiemHocTap') return parseFloat(val) || 0;
  if (header === 'CoDiemF') {
    return (
      val === true ||
      val === 1 ||
      String(val).toLowerCase() === 'true' ||
      String(val).toLowerCase() === '1' ||
      String(val).toLowerCase() === 'có'
    );
  }
  return String(val ?? '').trim();
};

// ─── Helper: lấy giá trị ô theo địa chỉ (VD: "B1") ──────────────────────────
const layGiaTriO = (ws, diaChi) => {
  const cell = ws[diaChi];
  return cell ? cell.v : undefined;
};

// ─── Component ────────────────────────────────────────────────────────────────
const DaoTaoImport = () => {
  const { maDot } = useParams();
  const { state: routeState } = useLocation();
  const navigate = useNavigate();

  // Thông tin đợt học bổng lấy từ router state
  const dotHocBong = routeState || {};
  const { hocKy: hocKyDot, namHoc: namHocDot, loaiDot } = dotHocBong;

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [danhSachPreview, setDanhSachPreview] = useState([]);
  const [tenFile, setTenFile] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Đếm enter/leave để tránh flicker khi di chuột qua child elements
  const dragCounterRef = useRef(0);

  // ─── Tạo file mẫu (pre-fill HocKy/NamHoc từ đợt hiện tại) ──────────────────
  const taiFileMau = () => {
    const aoaData = [
      ['HocKy', hocKyDot ?? ''],
      ['NamHoc', namHocDot ?? ''],
      [],
      ['MaSV', 'GPA', 'DiemHocTap', 'SoTC', 'CoDiemF', 'DiemSoDRL'],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    ws['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];

    XLSX.utils.book_append_sheet(wb, ws, 'DuLieuHocVu');
    const tenFileXuat = `Mau_Import_HocVu_HK${hocKyDot ?? 'X'}_${namHocDot ?? 'XXXX'}.xlsx`;
    XLSX.writeFile(wb, tenFileXuat);
    toast.info(`Đã tải file mẫu: ${tenFileXuat}`);
  };

  // ─── Parse file Excel theo cấu trúc mới ─────────────────────────────────────
  const parseFile = useCallback(
    (file) => {
      if (!file) return;

      setTenFile(file.name);
      setDanhSachPreview([]);

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];

          // ── Bước 1: Đọc B1 (HocKy) và B2 (NamHoc) ──────────────────────────
          const hocKyFile = layGiaTriO(ws, 'B1');
          const namHocFile = layGiaTriO(ws, 'B2');

          if (hocKyFile === undefined || namHocFile === undefined) {
            toast.error('File không đúng cấu trúc: Thiếu HocKy (B1) hoặc NamHoc (B2).');
            setTenFile('');
            return;
          }

          // ── Bước 2: Validate so với đợt đã chọn ─────────────────────────────
          const hocKyFileNum = Number(hocKyFile);
          if (
            hocKyDot !== undefined &&
            namHocDot !== undefined &&
            (hocKyFileNum !== Number(hocKyDot) ||
              String(namHocFile).trim() !== String(namHocDot).trim())
          ) {
            toast.error(
              `File không khớp với đợt đã chọn!\n` +
              `File: HK${hocKyFile} - ${namHocFile}\n` +
              `Đợt: HK${hocKyDot} - ${namHocDot}`
            );
            setTenFile('');
            return;
          }

          // ── Bước 3: Đọc dữ liệu từ dòng 4 (range: 3 = bỏ 3 dòng đầu) ───────
          const rows = XLSX.utils.sheet_to_json(ws, { range: 3, defval: '' });

          if (rows.length === 0) {
            toast.warning('File không có dữ liệu sinh viên (từ dòng 5 trở đi).');
            setTenFile('');
            return;
          }

          // ── Bước 4: Map sang DTO, thêm lại hocKy và namHoc ──────────────────
          const parsed = rows
            .filter((row) =>
              Object.values(row).some((v) => v !== '' && v !== null && v !== undefined)
            )
            .map((row) => {
              const obj = {
                hocKy: Number(hocKyFile),
                namHoc: String(namHocFile).trim(),
              };
              DATA_HEADERS.forEach((header) => {
                const dtoKey = HEADER_MAP[header];
                if (dtoKey) {
                  obj[dtoKey] = epKieu(header, row[header]);
                }
              });
              return obj;
            });

          if (parsed.length === 0) {
            toast.warning('Không tìm thấy dòng dữ liệu hợp lệ trong file.');
            setTenFile('');
            return;
          }

          setDanhSachPreview(parsed);
          toast.success(`Đọc file thành công: ${parsed.length} bản ghi.`);
        } catch (err) {
          toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
          console.error(err);
          setTenFile('');
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [hocKyDot, namHocDot]
  );

  // ─── Chọn file qua input ─────────────────────────────────────────────────────
  const xuLyChonFile = (e) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = '';
  };

  const xoaFile = () => {
    setDanhSachPreview([]);
    setTenFile('');
  };

  // ─── Drag & Drop handlers ────────────────────────────────────────────────────
  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      toast.error('Chỉ chấp nhận file .xlsx hoặc .xls');
      return;
    }
    parseFile(file);
  };

  // ─── Submit lên Backend ──────────────────────────────────────────────────────
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
      const msg = err?.response?.data?.message || err.message || 'Lỗi hệ thống.';
      toast.error(msg);
    } finally {
      setDangGui(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="space-y-6 relative"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      ref={dropZoneRef}
    >
      {/* ── Drag & Drop Overlay ─────────────────────────────────────────────── */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-blue-50/80 backdrop-blur-sm border-2 border-dashed border-blue-400 pointer-events-none">
          <UploadCloud className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
          <p className="text-blue-700 font-bold text-lg">Thả file vào đây</p>
          <p className="text-blue-500 text-sm mt-1">Chỉ chấp nhận .xlsx hoặc .xls</p>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dao-tao/danh-sach')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="bg-green-50 p-2.5 rounded-xl">
          <FileSpreadsheet className="text-green-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Import Dữ Liệu Học Vụ</h1>
          {loaiDot && (
            <p className="text-sm text-slate-500 mt-0.5">
              Đợt: <span className="font-semibold text-blue-600">{loaiDot}</span>
              {' · '}HK {hocKyDot} · {namHocDot}
            </p>
          )}
        </div>
      </div>

      {/* ── Action Card ─────────────────────────────────────────────────────── */}
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
            <UploadCloud className="w-4 h-4" />
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

        {/* Hướng dẫn kéo thả */}
        {!tenFile && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm select-none">
            <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Kéo &amp; thả file Excel vào đây, hoặc nhấn <span className="text-blue-500 font-semibold">Chọn file</span>
          </div>
        )}

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

      {/* ── Preview Table ────────────────────────────────────────────────────── */}
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
                  {/* HocKy & NamHoc từ metadata */}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    HocKy
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    NamHoc
                  </th>
                  {DATA_HEADERS.map((h) => (
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
                    <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{row.hocKy}</td>
                    <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{row.namHoc}</td>
                    {DATA_HEADERS.map((h) => {
                      const dtoKey = HEADER_MAP[h];
                      const val = row[dtoKey];
                      return (
                        <td key={h} className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                          {h === 'CoDiemF' ? (
                            val ? (
                              <span className="text-red-500 font-semibold">Có</span>
                            ) : (
                              <span className="text-green-600 font-semibold">Không</span>
                            )
                          ) : (
                            String(val ?? '')
                          )}
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
