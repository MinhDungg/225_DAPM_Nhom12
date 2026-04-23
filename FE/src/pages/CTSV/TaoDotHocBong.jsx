import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  PlusCircle, Loader2, X, BookOpen, Calendar, Zap,
  AlertTriangle, RefreshCw, Pencil, Trash2, Users,
  ChevronDown, CheckCircle, XCircle,
} from 'lucide-react';
import dotHocBongService from '../../services/dotHocBongService.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const NAM_HOC_OPTIONS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
const HOC_KY_OPTIONS = [1, 2];
const LOAI_DOT_OPTIONS = ['Khuyến khích học tập'];

const TRANG_THAI_BADGE = {
  KhoiTao:      { label: 'Khởi tạo',       cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  DaCoDiem:     { label: 'Đã có điểm',      cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
  DangXetDuyet: { label: 'Đang xét duyệt', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  DuKien:       { label: 'Dự kiến',         cls: 'bg-purple-100 text-purple-700 border border-purple-200' },
  ChinhThuc:    { label: 'Chính thức',      cls: 'bg-green-100 text-green-700 border border-green-200' },
  DaKetThuc:    { label: 'Đã kết thúc',    cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

const TRANG_THAI_UV_BADGE = {
  ChoXet: { label: 'Chờ xét',  cls: 'bg-blue-100 text-blue-700' },
  Loai:   { label: 'Loại',     cls: 'bg-red-100 text-red-600' },
};

// ─── Confirm Modal (generic) ──────────────────────────────────────────────────
const ConfirmModal = ({ title, body, confirmLabel, confirmCls, onConfirm, onCancel, loading }) => (
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
          className={`flex-1 py-2.5 ${confirmCls} text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95`}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Đang xử lý...</> : confirmLabel}
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Candidates Modal (Master-Detail) ────────────────────────────────────────
const CandidatesModal = ({ dot, onClose }) => {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [filterTrangThai, setFilterTrangThai] = useState('TatCa');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dotHocBongService.getDanhSachUngVien(dot.maDot);
        if (res.success) setDanhSach(res.data || []);
        else toast.error(res.message || 'Không thể tải danh sách ứng viên.');
      } catch {
        toast.error('Lỗi kết nối khi tải danh sách ứng viên.');
      } finally {
        setDangTai(false);
      }
    };
    fetch();
  }, [dot.maDot]);

  // Local filter — no API call
  const filtered = filterTrangThai === 'TatCa'
    ? danhSach
    : danhSach.filter(uv => uv.trangThai === filterTrangThai);

  const soChoXet = danhSach.filter(uv => uv.trangThai === 'ChoXet').length;
  const soLoai   = danhSach.filter(uv => uv.trangThai === 'Loai').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />
      <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col z-10"
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">
              Danh sách ứng viên — {dot.loaiDot}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              HK {dot.hocKy} · {dot.namHoc} ·{' '}
              <span className="text-blue-600 font-semibold">{soChoXet} chờ xét</span>
              {' · '}
              <span className="text-red-500 font-semibold">{soLoai} loại</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 mr-1">Lọc:</span>
          {[
            { val: 'TatCa', label: 'Tất cả', count: danhSach.length },
            { val: 'ChoXet', label: 'Chờ xét', count: soChoXet },
            { val: 'Loai', label: 'Loại', count: soLoai },
          ].map(opt => (
            <button key={opt.val}
              onClick={() => setFilterTrangThai(opt.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterTrangThai === opt.val
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {opt.label} ({opt.count})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {dangTai ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">Không có dữ liệu.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {['#', 'Mã SV', 'Họ tên', 'GPA', 'Điểm HT', 'Điểm RL', 'Trạng thái', 'Ghi chú'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((uv, idx) => {
                  const badge = TRANG_THAI_UV_BADGE[uv.trangThai] || { label: uv.trangThai, cls: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={uv.maSV} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{uv.maSV}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">{uv.hoTen}</td>
                      <td className="px-4 py-2.5 text-slate-700">{uv.gpa?.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-slate-700">{uv.diemHocTap?.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-slate-700">{uv.diemRenLuyen}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs max-w-[200px] truncate" title={uv.ghiChu || ''}>
                        {uv.ghiChu || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FORM_DEFAULT = { loaiDot: LOAI_DOT_OPTIONS[0], hocKy: 1, namHoc: '2025-2026' };

const TaoDotHocBong = () => {
  const [showForm, setShowForm] = useState(true);
  const [form, setForm] = useState(FORM_DEFAULT);
  const [editingMaDot, setEditingMaDot] = useState(null); // null = create mode
  const [dangGui, setDangGui] = useState(false);

  const [danhSachDot, setDanhSachDot] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  // Modals
  const [scanModal, setScanModal] = useState(null);   // dot to scan
  const [deleteModal, setDeleteModal] = useState(null); // dot to delete
  const [dangQuet, setDangQuet] = useState(false);
  const [dangXoa, setDangXoa] = useState(false);

  // Master-Detail
  const [candidatesDot, setCandidatesDot] = useState(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const taiDanhSach = useCallback(async () => {
    setDangTai(true);
    try {
      const res = await dotHocBongService.getDanhSachDot();
      if (res.success) {
        setDanhSachDot([...(res.data || [])].sort((a, b) => b.maDot - a.maDot));
      } else {
        toast.error(res.message || 'Không thể tải danh sách đợt.');
      }
    } catch {
      toast.error('Lỗi kết nối. Vui lòng kiểm tra Backend đang chạy.');
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => { taiDanhSach(); }, [taiDanhSach]);

  // ─── Form ────────────────────────────────────────────────────────────────────
  const xuLyThayDoi = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'hocKy' ? Number(value) : value }));
  };

  const batDauSua = (dot, e) => {
    e.stopPropagation();
    setEditingMaDot(dot.maDot);
    setForm({ loaiDot: dot.loaiDot, hocKy: dot.hocKy, namHoc: dot.namHoc });
    setShowForm(true);
  };

  const huyForm = () => {
    setEditingMaDot(null);
    setForm(FORM_DEFAULT);
  };

  const xuLySubmit = async (e) => {
    e.preventDefault();
    if (!form.namHoc.trim()) { toast.error('Vui lòng nhập năm học.'); return; }
    setDangGui(true);
    try {
      const payload = { loaiDot: form.loaiDot, hocKy: form.hocKy, namHoc: form.namHoc.trim() };
      let res;
      if (editingMaDot) {
        res = await dotHocBongService.updateDotHocBong(editingMaDot, payload);
      } else {
        res = await dotHocBongService.createDotHocBong(payload);
      }
      if (res.success) {
        toast.success(res.message || (editingMaDot ? 'Cập nhật thành công!' : 'Tạo đợt thành công!'));
        huyForm();
        await taiDanhSach();
      } else {
        toast.error(res.message || 'Thao tác thất bại.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi hệ thống.');
    } finally {
      setDangGui(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const xuLyXoa = async () => {
    if (!deleteModal) return;
    setDangXoa(true);
    try {
      const res = await dotHocBongService.deleteDotHocBong(deleteModal.maDot);
      if (res.success) {
        toast.success('Đã xóa đợt học bổng.');
        setDeleteModal(null);
        await taiDanhSach();
      } else {
        toast.error(res.message || 'Xóa thất bại.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi hệ thống.');
    } finally {
      setDangXoa(false);
    }
  };

  // ─── Auto-scan ───────────────────────────────────────────────────────────────
  const xuLyQuet = async () => {
    if (!scanModal) return;
    setDangQuet(true);
    try {
      const res = await dotHocBongService.tuDongQuet(scanModal.maDot);
      if (res.success) {
        toast.success(`Quét thành công! Đã tạo ${res.data?.soLuongTao ?? 0} hồ sơ xét duyệt.`);
        setScanModal(null);
        await taiDanhSach();
      } else {
        toast.error(res.message || 'Quét ứng viên thất bại.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi hệ thống.');
    } finally {
      setDangQuet(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full overflow-hidden h-full gap-0">

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="overflow-hidden shrink-0">
            <div className="w-[400px] h-full bg-white border-r border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${editingMaDot ? 'bg-amber-50' : 'bg-blue-50'}`}>
                    {editingMaDot
                      ? <Pencil className="text-amber-600 w-5 h-5" />
                      : <PlusCircle className="text-blue-600 w-5 h-5" />}
                  </div>
                  <span className="font-bold text-slate-800">
                    {editingMaDot ? 'Cập nhật đợt' : 'Tạo đợt mới'}
                  </span>
                </div>
                <button onClick={() => { setShowForm(false); huyForm(); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={xuLySubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại đợt xét</label>
                  <select name="loaiDot" value={form.loaiDot} onChange={xuLyThayDoi}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
                    {LOAI_DOT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Học kỳ</label>
                  <select name="hocKy" value={form.hocKy} onChange={xuLyThayDoi}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
                    {HOC_KY_OPTIONS.map(hk => <option key={hk} value={hk}>Học kỳ {hk}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Năm học</label>
                  <select name="namHoc" value={form.namHoc} onChange={xuLyThayDoi}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
                    {NAM_HOC_OPTIONS.map(nh => <option key={nh} value={nh}>{nh}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  {editingMaDot && (
                    <button type="button" onClick={huyForm}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-50 transition active:scale-95">
                      Hủy sửa
                    </button>
                  )}
                  <button type="submit" disabled={dangGui}
                    className={`flex-1 py-2.5 ${editingMaDot ? 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'} text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95`}>
                    {dangGui
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Đang lưu...</>
                      : editingMaDot
                        ? <><Pencil className="w-4 h-4" />Cập nhật</>
                        : <><PlusCircle className="w-4 h-4" />Tạo đợt học bổng</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Đợt Học Bổng</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {danhSachDot.length} đợt · Nút <span className="font-semibold text-teal-600">Quét ứng viên</span> chỉ hiện khi đợt ở trạng thái <span className="font-semibold text-teal-600">Đã có điểm</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={taiDanhSach} disabled={dangTai}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition" title="Làm mới">
              <RefreshCw className={`w-4 h-4 ${dangTai ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => { setShowForm(v => !v); if (showForm) huyForm(); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition active:scale-95">
              {showForm ? <><X className="w-4 h-4" />Đóng Form</> : <><PlusCircle className="w-4 h-4" />Thêm đợt mới</>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {dangTai && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          {!dangTai && danhSachDot.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">Chưa có đợt nào</h3>
              <p className="text-sm text-slate-500">Nhấn <span className="font-semibold text-blue-600">Thêm đợt mới</span> để bắt đầu.</p>
            </div>
          )}

          {!dangTai && danhSachDot.map((dot) => {
            const badge = TRANG_THAI_BADGE[dot.trangThai] || { label: dot.trangThai, cls: 'bg-gray-100 text-gray-500 border border-gray-200' };
            const coTheQuet = dot.trangThai === 'DaCoDiem';
            const coTheXoa  = dot.trangThai === 'KhoiTao' || dot.trangThai === 'DaCoDiem';
            const coTheSua  = dot.trangThai === 'KhoiTao' || dot.trangThai === 'DaCoDiem';
            const coThemXemUngVien = dot.trangThai === 'DangXetDuyet' || dot.trangThai === 'DuKien' || dot.trangThai === 'ChinhThuc';

            return (
              <motion.div key={dot.maDot} layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => coThemXemUngVien && setCandidatesDot(dot)}
                className={`bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 transition-all duration-200 ${coThemXemUngVien ? 'hover:shadow-md hover:border-blue-100 cursor-pointer' : ''}`}>
                <div className="bg-blue-50 p-2.5 rounded-xl shrink-0">
                  <BookOpen className="text-blue-600 w-5 h-5" />
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

                {/* Action buttons — stopPropagation to avoid triggering card click */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  {coThemXemUngVien && (
                    <button onClick={() => setCandidatesDot(dot)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition active:scale-95">
                      <Users className="w-3.5 h-3.5" />Ứng viên
                    </button>
                  )}
                  {coTheQuet && (
                    <button onClick={() => setScanModal(dot)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition active:scale-95">
                      <Zap className="w-3.5 h-3.5" />Quét ứng viên
                    </button>
                  )}
                  {coTheSua && (
                    <button onClick={(e) => batDauSua(dot, e)}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 transition active:scale-95" title="Sửa">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {coTheXoa && (
                    <button onClick={(e) => { e.stopPropagation(); setDeleteModal(dot); }}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition active:scale-95" title="Xóa">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scan Confirm Modal */}
      <AnimatePresence>
        {scanModal && (
          <ConfirmModal
            title="Xác nhận Quét ứng viên"
            body={`Hệ thống sẽ chốt dữ liệu điểm đầu vào và tự động tạo hồ sơ xét duyệt. Phòng Đào tạo sẽ không thể sửa điểm sau bước này. Bạn có chắc chắn muốn thực hiện?`}
            confirmLabel={<><Zap className="w-4 h-4" />Xác nhận quét</>}
            confirmCls="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300"
            onConfirm={xuLyQuet}
            onCancel={() => { if (!dangQuet) setScanModal(null); }}
            loading={dangQuet}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteModal && (
          <ConfirmModal
            title="Xác nhận Xóa đợt"
            body={`Bạn có chắc chắn muốn xóa đợt "${deleteModal.loaiDot}" (HK ${deleteModal.hocKy} - ${deleteModal.namHoc})? Hành động này không thể hoàn tác.`}
            confirmLabel={<><Trash2 className="w-4 h-4" />Xóa đợt</>}
            confirmCls="bg-red-500 hover:bg-red-600 disabled:bg-red-300"
            onConfirm={xuLyXoa}
            onCancel={() => { if (!dangXoa) setDeleteModal(null); }}
            loading={dangXoa}
          />
        )}
      </AnimatePresence>

      {/* Candidates Master-Detail Modal */}
      <AnimatePresence>
        {candidatesDot && (
          <CandidatesModal dot={candidatesDot} onClose={() => setCandidatesDot(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaoDotHocBong;
