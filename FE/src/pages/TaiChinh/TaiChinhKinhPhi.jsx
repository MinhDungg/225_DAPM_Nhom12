import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import {
  Landmark, BookOpen, Calendar, ArrowLeft, Download,
  Upload, Loader2, AlertTriangle, CheckCircle, RefreshCw,
  FileSpreadsheet, X, FileUp,
} from 'lucide-react';
import kinhPhiService from '../../services/kinhPhiService.js';

// ─── Animation variants ───────────────────────────────────────────────────────
const listVariants  = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };
const detailVariants = { initial: { opacity: 0, x: 20 },  animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } };
const tx = { duration: 0.22, ease: 'easeOut' };

// ─── Badge config ─────────────────────────────────────────────────────────────
const BADGE = {
  KhoiTao:   { label: 'Mới khởi tạo', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  DaCoDiem:  { label: 'Đã có điểm',   cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
  ChinhThuc: { label: 'Đã hoàn tất',  cls: 'bg-slate-100 text-slate-700 border border-slate-200' },
};

// ─── Currency helpers ─────────────────────────────────────────────────────────
const formatVND = (n) =>
  n === '' || n === null || n === undefined ? '' : Number(n).toLocaleString('vi-VN');

const parseVND = (s) => {
  const raw = String(s).replace(/[^0-9]/g, '');
  return raw === '' ? 0 : parseInt(raw, 10);
};

// ─── Excel column headers ─────────────────────────────────────────────────────
const EXCEL_HEADERS = ['MaKhoa', 'TenKhoa', 'KinhPhi', 'MucHBLoaiKha'];

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, body, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel} />
    <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-amber-50 p-2.5 rounded-xl">
          <AlertTriangle className="text-amber-500 w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">{body}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-50 transition active:scale-95 disabled:opacity-50">
          Hủy bỏ
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Đang lưu...</>
            : <><CheckCircle className="w-4 h-4" />Xác nhận chốt</>}
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Editable currency cell ───────────────────────────────────────────────────
const CurrencyCell = ({ value, onChange, disabled = false }) => {
  const [display, setDisplay] = useState(formatVND(value));
  const [focused, setFocused] = useState(false);

  // Sync display when value changes externally (e.g. from Excel import)
  useEffect(() => {
    if (!focused) setDisplay(formatVND(value));
  }, [value, focused]);

  const handleFocus = () => {
    if (disabled) return;
    setFocused(true);
    setDisplay(value === 0 ? '' : String(value));
  };

  const handleChange = (e) => {
    if (disabled) return;
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setDisplay(raw);
    onChange(raw === '' ? 0 : parseInt(raw, 10));
  };

  const handleBlur = () => {
    setFocused(false);
    setDisplay(formatVND(value));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className={`w-full text-right border rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        disabled
          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
          : 'bg-white border-gray-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400'
      }`}
      placeholder="0"
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TaiChinhKinhPhi = () => {
  const [danhSachDot, setDanhSachDot] = useState([]);
  const [dangTaiDot, setDangTaiDot] = useState(true);
  const [selectedDot, setSelectedDot] = useState(null);

  // Khoa list & table rows
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [rows, setRows] = useState([]); // [{ maKhoa, tenKhoa, kinhPhi, mucHBLoaiKha }]
  const [dangTaiKhoa, setDangTaiKhoa] = useState(false);

  // Excel import
  const fileInputRef = useRef(null);
  const tableRef = useRef(null);
  const [tenFile, setTenFile] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Confirm modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);

  // ─── Fetch periods ──────────────────────────────────────────────────────────
  const taiDanhSachDot = useCallback(async () => {
    setDangTaiDot(true);
    try {
      const res = await kinhPhiService.getDotHocBongKHTC();
      if (res.success) {
        setDanhSachDot([...(res.data || [])].sort((a, b) => b.maDot - a.maDot));
      } else {
        toast.error(res.message || 'Không thể tải danh sách đợt.');
      }
    } catch {
      toast.error('Lỗi kết nối. Vui lòng kiểm tra Backend đang chạy.');
    } finally {
      setDangTaiDot(false);
    }
  }, []);

  useEffect(() => { taiDanhSachDot(); }, [taiDanhSachDot]);

  // ─── Fetch Khoa list + existing allocations when a dot is selected ──────────
  const taiDanhSachKhoa = useCallback(async (dot) => {
    setDangTaiKhoa(true);
    try {
      const resKhoa = await kinhPhiService.getDanhSachKhoa();
      if (!resKhoa.success || !Array.isArray(resKhoa.data)) {
        toast.error(resKhoa.message || 'Không thể tải danh sách Khoa.');
        return;
      }

      setDanhSachKhoa(resKhoa.data);

      let resPhanBo = { success: true, data: [] };
      try {
        resPhanBo = await kinhPhiService.getPhanBoTheoMaDot(dot.maDot);
      } catch (err) {
        console.warn('Không tải được phân bổ kinh phí, tiếp tục hiển thị danh sách khoa rỗng.', err);
      }

      const phanBoMap = {};
      if (resPhanBo.success && Array.isArray(resPhanBo.data)) {
        resPhanBo.data.forEach(p => {
          phanBoMap[p.maKhoa] = p;
        });
      }

      setRows(resKhoa.data.map(k => {
        const existing = phanBoMap[k.maKhoa];
        return {
          maKhoa: k.maKhoa,
          tenKhoa: k.tenKhoa,
          kinhPhi: existing ? Number(existing.kinhPhi) : 0,
          mucHBLoaiKha: existing ? Number(existing.mucHBLoaiKha) : 0,
        };
      }));
    } catch {
      toast.error('Lỗi kết nối khi tải dữ liệu kinh phí.');
    } finally {
      setDangTaiKhoa(false);
    }
  }, []);

  // ─── Drill-down navigation ───────────────────────────────────────────────────
  const chonDot = (dot) => {
    setSelectedDot(dot);
    setTenFile('');
    taiDanhSachKhoa(dot);
  };

  const quayLai = () => {
    setSelectedDot(null);
    setRows([]);
    setTenFile('');
  };

  // ─── Row update ──────────────────────────────────────────────────────────────
  const capNhatRow = (maKhoa, field, value) => {
    setRows(prev => prev.map(r => r.maKhoa === maKhoa ? { ...r, [field]: value } : r));
  };

  // ─── Real-time total ─────────────────────────────────────────────────────────
  const tongKinhPhi = rows.reduce((sum, r) => sum + (r.kinhPhi || 0), 0);

  // ─── Read-only guard ─────────────────────────────────────────────────────────
  const isReadOnly = selectedDot?.trangThai === 'ChinhThuc';

  // ─── Template generator ──────────────────────────────────────────────────────
  const taiFileMau = () => {
    if (!selectedDot) return;
    const aoaData = [
      ['HocKy', selectedDot.hocKy],
      ['NamHoc', selectedDot.namHoc],
      [],
      ['MaKhoa', 'TenKhoa', 'KinhPhi', 'MucHBLoaiKha'],
      ...danhSachKhoa.map(k => [k.maKhoa, k.tenKhoa, 0, 0]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    ws['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'KinhPhi');
    const tenFileXuat = `Mau_KinhPhi_HK${selectedDot.hocKy}_${selectedDot.namHoc}.xlsx`;
    XLSX.writeFile(wb, tenFileXuat);
    toast.info(`Đã tải file mẫu: ${tenFileXuat}`);
  };

  // ─── Excel import (decoupled — accepts any File object) ─────────────────────
  const xuLyImportExcel = useCallback((file) => {
    if (!file || !selectedDot) return;
    setTenFile(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];

        // Validate B1 (HocKy) and B2 (NamHoc)
        const hocKyFile = ws['B1']?.v;
        const namHocFile = ws['B2']?.v;

        if (hocKyFile === undefined || namHocFile === undefined) {
          toast.error('File không đúng cấu trúc: Thiếu HocKy (B1) hoặc NamHoc (B2).');
          setTenFile('');
          return;
        }

        if (
          Number(hocKyFile) !== Number(selectedDot.hocKy) ||
          String(namHocFile).trim() !== String(selectedDot.namHoc).trim()
        ) {
          toast.error(
            `File không khớp với đợt đã chọn! ` +
            `File: HK${hocKyFile} - ${namHocFile} | ` +
            `Đợt: HK${selectedDot.hocKy} - ${selectedDot.namHoc}`
          );
          setTenFile('');
          return;
        }

        // Parse data rows (range: 3 = skip first 3 rows)
        const dataRows = XLSX.utils.sheet_to_json(ws, { range: 3, defval: '' });

        if (dataRows.length === 0) {
          toast.warning('File không có dữ liệu Khoa.');
          return;
        }

        // Merge into rows state
        setRows(prev => prev.map(r => {
          const match = dataRows.find(d => String(d['MaKhoa']) === String(r.maKhoa));
          if (!match) return r;
          return {
            ...r,
            kinhPhi: parseVND(match['KinhPhi']),
            mucHBLoaiKha: parseVND(match['MucHBLoaiKha']),
          };
        }));

        toast.success(`Import thành công: ${dataRows.length} dòng dữ liệu.`);

        // Auto-scroll to table after successful import
        setTimeout(() => {
          tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } catch (err) {
        toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
        console.error(err);
        setTenFile('');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [selectedDot]);

  // ─── File input handler (delegates to xuLyImportExcel) ───────────────────────
  const xuLyChonFile = (e) => {
    const file = e.target.files?.[0];
    if (file) xuLyImportExcel(file);
    e.target.value = '';
  };

  // ─── Drag & Drop handlers ─────────────────────────────────────────────────────
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      toast.error('Chỉ chấp nhận file .xlsx hoặc .xls. Vui lòng thử lại.');
      return;
    }

    xuLyImportExcel(file);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const xuLyChotNganSach = async () => {
    if (!selectedDot) return;
    setDangLuu(true);
    try {
      const payload = rows
        .filter(r => r.kinhPhi > 0 || r.mucHBLoaiKha > 0)
        .map(r => ({
          maDot: selectedDot.maDot,
          maKhoa: r.maKhoa,
          kinhPhi: r.kinhPhi,
          mucHBLoaiKha: r.mucHBLoaiKha,
        }));

      if (payload.length === 0) {
        toast.warning('Chưa có Khoa nào được nhập kinh phí.');
        setDangLuu(false);
        setShowConfirm(false);
        return;
      }

      const res = await kinhPhiService.thietLapKinhPhi(payload);
      if (res.success) {
        toast.success(res.message || `Đã chốt ngân sách cho ${payload.length} Khoa.`);
        setShowConfirm(false);
        await taiDanhSachKhoa(selectedDot);
        await taiDanhSachDot();
      } else {
        toast.error(res.message || 'Chốt ngân sách thất bại.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi hệ thống.');
    } finally {
      setDangLuu(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {selectedDot === null ? (
          /* ── LIST VIEW ──────────────────────────────────────────────────── */
          <motion.div key="list" variants={listVariants} initial="initial" animate="animate" exit="exit"
            transition={tx} className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2.5 rounded-xl">
                  <Landmark className="text-emerald-600 w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Thiết lập Kinh phí Học bổng</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Chọn đợt học bổng để phân bổ ngân sách cho các Khoa
                  </p>
                </div>
              </div>
              <button onClick={taiDanhSachDot} disabled={dangTaiDot}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition" title="Làm mới">
                <RefreshCw className={`w-4 h-4 ${dangTaiDot ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Period cards */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {dangTaiDot && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              )}
              {!dangTaiDot && danhSachDot.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-700 mb-1">Không có đợt nào phù hợp</h3>
                  <p className="text-sm text-slate-500">
                    Chỉ hiển thị đợt ở trạng thái <span className="font-semibold text-blue-600">Mới khởi tạo</span>, <span className="font-semibold text-teal-600">Đã có điểm</span> hoặc <span className="font-semibold text-slate-600">Đã hoàn tất</span>.
                  </p>
                </div>
              )}
              {!dangTaiDot && danhSachDot.map(dot => {
                const badge = BADGE[dot.trangThai] || { label: dot.trangThai, cls: 'bg-gray-100 text-gray-500 border border-gray-200' };
                return (
                  <motion.div key={dot.maDot} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => chonDot(dot)}
                    className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-emerald-100 cursor-pointer transition-all duration-200">
                    <div className="bg-emerald-50 p-2.5 rounded-xl shrink-0">
                      <BookOpen className="text-emerald-600 w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{dot.loaiDot}</p>
                      <span className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Calendar className="w-3 h-3" />HK {dot.hocKy} · {dot.namHoc}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <Landmark className="w-4 h-4 text-slate-300 shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* ── DETAIL VIEW (Phân bổ kinh phí) ────────────────────────────── */
          <motion.div key={`detail-${selectedDot.maDot}`} variants={detailVariants}
            initial="initial" animate="animate" exit="exit" transition={tx}
            className="flex flex-col h-full">
            {/* Detail Header */}
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <button onClick={quayLai}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition active:scale-95 shrink-0">
                <ArrowLeft className="w-4 h-4" />Quay lại
              </button>
              <div className="w-px h-6 bg-slate-200 shrink-0" />
              <div className="bg-emerald-50 p-2 rounded-xl shrink-0">
                <Landmark className="text-emerald-600 w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-800 truncate">
                  Phân bổ Kinh phí — {selectedDot.loaiDot}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  HK {selectedDot.hocKy} · {selectedDot.namHoc}
                </p>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
              {!isReadOnly && (
                <button onClick={taiFileMau} disabled={dangTaiKhoa}
                  className="flex items-center gap-2 px-4 py-2.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-50">
                  <Download className="w-4 h-4" />Tải file mẫu (.xlsx)
                </button>
              )}
              {!isReadOnly && (
                <>
                  <button onClick={() => fileInputRef.current?.click()} disabled={dangTaiKhoa}
                    className="flex items-center gap-2 px-4 py-2.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-50">
                    <Upload className="w-4 h-4" />Import Excel
                  </button>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={xuLyChonFile} className="hidden" />
                </>
              )}

              {tenFile && !isReadOnly && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs text-slate-700 font-medium truncate max-w-[180px]">{tenFile}</span>
                  <button onClick={() => setTenFile('')} className="text-slate-400 hover:text-red-500 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Read-only badge */}
              {isReadOnly && (
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2">
                  <span className="text-sm font-semibold text-slate-600">
                    🔒 Đợt học bổng đã hoàn tất (Chỉ xem)
                  </span>
                </div>
              )}

              {!isReadOnly && (
                <div className="ml-auto">
                  <button onClick={() => setShowConfirm(true)} disabled={dangTaiKhoa}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-semibold transition active:scale-95">
                    <CheckCircle className="w-4 h-4" />Chốt Ngân Sách
                  </button>
                </div>
              )}
            </div>

            {/* ── Drop Zone (only shown when not read-only and no file loaded) ── */}
            {!isReadOnly && !dangTaiKhoa && (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mb-4 shrink-0 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none ${
                  isDragging
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-gray-300 hover:bg-emerald-50 hover:border-emerald-400'
                }`}
              >
                <FileUp
                  className={`w-8 h-8 transition-colors ${
                    isDragging ? 'text-blue-500 animate-bounce' : 'text-slate-400'
                  }`}
                />
                <p className={`text-sm font-semibold transition-colors ${
                  isDragging ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {isDragging
                    ? 'Thả file vào đây...'
                    : 'Kéo thả file Excel tại đây hoặc click để chọn file'}
                </p>
                <p className="text-xs text-slate-400">Chỉ chấp nhận .xlsx hoặc .xls</p>
              </div>
            )}

            {/* Editable Spreadsheet */}
            <div ref={tableRef} className="flex-1 overflow-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
              {dangTaiKhoa ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên Khoa</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-52">Tổng kinh phí (VNĐ)</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-52">Mức HB Loại Khá (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {rows.map((row, idx) => (
                      <tr key={row.maKhoa} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{row.tenKhoa}</td>
                        <td className="px-4 py-2.5">
                          <CurrencyCell
                            value={row.kinhPhi}
                            onChange={(v) => capNhatRow(row.maKhoa, 'kinhPhi', v)}
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <CurrencyCell
                            value={row.mucHBLoaiKha}
                            onChange={(v) => capNhatRow(row.maKhoa, 'mucHBLoaiKha', v)}
                            disabled={isReadOnly}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Auto-sum footer */}
                  <tfoot className="bg-emerald-50 border-t-2 border-emerald-200 sticky bottom-0">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right font-bold text-slate-700 text-sm uppercase tracking-wide">
                        Tổng cộng
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-700 text-base">
                        {formatVND(tongKinhPhi)} đ
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmModal
            title="Xác nhận Chốt Ngân Sách"
            body={`Bạn sắp chốt phân bổ kinh phí cho đợt "${selectedDot?.loaiDot}" (HK ${selectedDot?.hocKy} - ${selectedDot?.namHoc}). Tổng kinh phí: ${formatVND(tongKinhPhi)} đ. Hành động này sẽ ghi đè dữ liệu cũ nếu đã có. Bạn có chắc chắn?`}
            onConfirm={xuLyChotNganSach}
            onCancel={() => { if (!dangLuu) setShowConfirm(false); }}
            loading={dangLuu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaiChinhKinhPhi;
