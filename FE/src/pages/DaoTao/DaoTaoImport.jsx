import React, { useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import {
  Download, CheckCircle, Loader2, FileSpreadsheet,
  X, UploadCloud, ArrowLeft, BookOpen, Calendar,
} from 'lucide-react';
import diemService from '../../services/diemService.js';
import sinhVienService from '../../services/sinhVienService.js';

// ─── Cấu trúc file Excel quy ước ─────────────────────────────────────────────
// Dòng 1: ["HocKy",  <giá trị>]   → B1
// Dòng 2: ["NamHoc", <giá trị>]   → B2
// Dòng 3: [] (trống)
// Dòng 4: ["MaSV", "GPA", "DiemHocTap", "SoTC", "CoDiemF", "DiemSoDRL"]  ← header
// Dòng 5+: dữ liệu sinh viên

// Cột dữ liệu trong file (không gồm HocKy/NamHoc — lấy từ B1/B2)
const DATA_HEADERS = ['MaSV', 'GPA', 'DiemHocTap', 'SoTC', 'CoDiemF', 'DiemSoDRL'];

// Map tên cột Excel → DTO key (camelCase)
const HEADER_MAP = {
  MaSV: 'maSV',
  GPA: 'gPA',
  DiemHocTap: 'diemHocTap',
  SoTC: 'soTC',
  CoDiemF: 'coDiemF',
  DiemSoDRL: 'diemSoDRL',
};

// Cột hiển thị trong bảng Preview (HocKy/NamHoc đã chuyển lên Header)
// Thứ tự: #, MaSV, HoTen, GPA, DiemHocTap, SoTC, CoDiemF, DiemSoDRL
const PREVIEW_COLS = ['MaSV', 'HoTen', 'GPA', 'DiemHocTap', 'SoTC', 'CoDiemF', 'DiemSoDRL'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const layGiaTriO = (ws, diaChi) => {
  const cell = ws[diaChi];
  return cell ? cell.v : undefined;
};

// ─── Component ────────────────────────────────────────────────────────────────
const DaoTaoImport = () => {
  const { maDot } = useParams();
  const { state: routeState } = useLocation();
  const navigate = useNavigate();

  const dotHocBong = routeState || {};
  const { hocKy: hocKyDot, namHoc: namHocDot, loaiDot } = dotHocBong;

  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  const [danhSachPreview, setDanhSachPreview] = useState([]);
  // Metadata từ file (B1/B2) — dùng cho Badge ở Header
  const [metaFile, setMetaFile] = useState({ hocKy: null, namHoc: null });
  const [tenFile, setTenFile] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [dangXacThuc, setDangXacThuc] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ─── Tạo file mẫu ────────────────────────────────────────────────────────────
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

  // ─── Parse + Verify ───────────────────────────────────────────────────────────
  const parseFile = useCallback(
    (file) => {
      if (!file) return;

      setTenFile(file.name);
      setDanhSachPreview([]);
      setMetaFile({ hocKy: null, namHoc: null });

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];

          // ── 1. Đọc B1/B2 ────────────────────────────────────────────────────
          const hocKyFile = layGiaTriO(ws, 'B1');
          const namHocFile = layGiaTriO(ws, 'B2');

          if (hocKyFile === undefined || namHocFile === undefined) {
            toast.error('File không đúng cấu trúc: Thiếu HocKy (B1) hoặc NamHoc (B2).');
            setTenFile('');
            return;
          }

          // ── 2. Validate vs đợt đã chọn ──────────────────────────────────────
          if (
            hocKyDot !== undefined &&
            namHocDot !== undefined &&
            (Number(hocKyFile) !== Number(hocKyDot) ||
              String(namHocFile).trim() !== String(namHocDot).trim())
          ) {
            toast.error(
              `File không khớp với đợt đã chọn! ` +
              `File: HK${hocKyFile} - ${namHocFile} | ` +
              `Đợt: HK${hocKyDot} - ${namHocDot}`
            );
            setTenFile('');
            return;
          }

          // ── 3. Đọc dữ liệu từ dòng 4 (range: 3) ────────────────────────────
          const rows = XLSX.utils.sheet_to_json(ws, { range: 3, defval: '' });

          if (rows.length === 0) {
            toast.warning('File không có dữ liệu sinh viên (từ dòng 5 trở đi).');
            setTenFile('');
            return;
          }

          // ── 4. Map sang DTO ──────────────────────────────────────────────────
          const parsed = rows
            .filter((row) =>
              Object.values(row).some((v) => v !== '' && v !== null && v !== undefined)
            )
            .map((row) => {
              const obj = {
                hocKy: Number(hocKyFile),
                namHoc: String(namHocFile).trim(),
                hoTen: '', // sẽ được điền sau khi verify
              };
              DATA_HEADERS.forEach((header) => {
                const dtoKey = HEADER_MAP[header];
                if (dtoKey) obj[dtoKey] = epKieu(header, row[header]);
              });
              return obj;
            });

          if (parsed.length === 0) {
            toast.warning('Không tìm thấy dòng dữ liệu hợp lệ trong file.');
            setTenFile('');
            return;
          }

          // ── 5. Gọi API verify để lấy HoTen ──────────────────────────────────
          setDangXacThuc(true);
          try {
            const maSVList = parsed.map((r) => r.maSV).filter(Boolean);
            const verifyRes = await sinhVienService.verifyList(maSVList);

            // Build lookup map: maSV → hoTen (case-insensitive)
            const hoTenMap = {};
            if (verifyRes.success && Array.isArray(verifyRes.data)) {
              verifyRes.data.forEach((sv) => {
                hoTenMap[sv.maSV.toLowerCase()] = sv.hoTen;
              });
            }

            // ── 6. Merge HoTen vào từng dòng ────────────────────────────────
            const merged = parsed.map((row) => ({
              ...row,
              hoTen: hoTenMap[row.maSV?.toLowerCase()] ?? '⚠ Không tìm thấy',
            }));

            setMetaFile({ hocKy: hocKyFile, namHoc: String(namHocFile).trim() });
            setDanhSachPreview(merged);
            toast.success(`Đọc file thành công: ${merged.length} bản ghi.`);
          } catch (verifyErr) {
            // Nếu verify thất bại (VD: 401), vẫn hiển thị preview nhưng không có tên
            console.warn('Verify API failed, showing preview without names.', verifyErr);
            setMetaFile({ hocKy: hocKyFile, namHoc: String(namHocFile).trim() });
            setDanhSachPreview(parsed);
            toast.warning('Không thể xác thực tên sinh viên. Kiểm tra lại quyền truy cập.');
          } finally {
            setDangXacThuc(false);
          }
        } catch (err) {
          toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
          console.error(err);
          setTenFile('');
          setDangXacThuc(false);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [hocKyDot, namHocDot]
  );

  const xuLyChonFile = (e) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = '';
  };

  const xoaFile = () => {
    setDanhSachPreview([]);
    setTenFile('');
    setMetaFile({ hocKy: null, namHoc: null });
  };

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  };
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
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

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const xuLyImport = async () => {
    if (danhSachPreview.length === 0) {
      toast.warning('Chưa có dữ liệu để import. Vui lòng chọn file trước.');
      return;
    }

    // Loại bỏ field hoTen trước khi gửi lên Backend (không có trong DTO)
    const payload = danhSachPreview.map(({ hoTen, ...rest }) => rest);

    setDangGui(true);
    try {
      const res = await diemService.importDuLieuHocVu(payload);
      if (res.success) {
        const { thanhCong, thatBai, danhSachLoi } = res.data || {};
        toast.success(`Import thành công: ${thanhCong ?? 0} bản ghi. Thất bại: ${thatBai ?? 0}.`);
        if (danhSachLoi?.length > 0) {
          toast.warning(`Mã SV không hợp lệ: ${danhSachLoi.join(', ')}`);
        }
        xoaFile();
      } else {
        toast.error(res.message || 'Import thất bại.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi hệ thống.');
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
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-blue-50/80 backdrop-blur-sm border-2 border-dashed border-blue-400 pointer-events-none">
          <UploadCloud className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
          <p className="text-blue-700 font-bold text-lg">Thả file vào đây</p>
          <p className="text-blue-500 text-sm mt-1">Chỉ chấp nhận .xlsx hoặc .xls</p>
        </div>
      )}

      {/* Page Header */}
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

      {/* Action Card */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={taiFileMau}
            className="flex items-center gap-2 px-4 py-2.5 border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-semibold transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            Tải file mẫu (.xlsx)
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={dangXacThuc}
            className="flex items-center gap-2 px-4 py-2.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-50"
          >
            {dangXacThuc ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Đang xác thực...</>
            ) : (
              <><UploadCloud className="w-4 h-4" />Chọn file Excel</>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={xuLyChonFile}
            className="hidden"
          />
        </div>

        {/* Drop hint */}
        {!tenFile && !dangXacThuc && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm select-none">
            <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Kéo &amp; thả file Excel vào đây, hoặc nhấn{' '}
            <span className="text-blue-500 font-semibold">Chọn file</span>
          </div>
        )}

        {/* Verifying spinner */}
        {dangXacThuc && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
            <span className="text-sm text-blue-700 font-medium">
              Đang xác thực tên sinh viên từ hệ thống...
            </span>
          </div>
        )}

        {/* File name chip */}
        {tenFile && !dangXacThuc && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-sm text-slate-700 font-medium truncate flex-1">{tenFile}</span>
            <button onClick={xoaFile} className="text-slate-400 hover:text-red-500 transition shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Table */}
      {danhSachPreview.length > 0 && (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          {/* ── Preview Header (Flexbox) ── */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-semibold text-slate-700 text-sm">
                Xem trước dữ liệu{' '}
                <span className="text-blue-600">({danhSachPreview.length} bản ghi)</span>
              </h2>
              {/* Badges: Học kỳ & Năm học */}
              {metaFile.hocKy !== null && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                  <BookOpen className="w-3 h-3" />
                  Học kỳ {metaFile.hocKy}
                </span>
              )}
              {metaFile.namHoc !== null && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                  <Calendar className="w-3 h-3" />
                  {metaFile.namHoc}
                </span>
              )}
            </div>

            <button
              onClick={xuLyImport}
              disabled={dangGui}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold transition active:scale-95 shrink-0"
            >
              {dangGui ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Đang import...</>
              ) : (
                <><CheckCircle className="w-4 h-4" />Xác nhận &amp; Import</>
              )}
            </button>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
                  {PREVIEW_COLS.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col === 'HoTen' ? 'Họ tên' : col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {danhSachPreview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{idx + 1}</td>

                    {/* MaSV */}
                    <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap font-mono text-xs">
                      {row.maSV}
                    </td>

                    {/* HoTen */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {row.hoTen?.startsWith('⚠') ? (
                        <span className="text-amber-600 font-medium text-xs">{row.hoTen}</span>
                      ) : (
                        <span className="text-slate-800 font-medium">{row.hoTen}</span>
                      )}
                    </td>

                    {/* Remaining data columns */}
                    {['GPA', 'DiemHocTap', 'SoTC', 'CoDiemF', 'DiemSoDRL'].map((h) => {
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
                          ) : (h === 'GPA' || h === 'DiemHocTap') && val != null ? (
                            Number(val).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
