import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import dotHocBongService from '../../../services/dotHocBongService.js';

// ─── Badge config ─────────────────────────────────────────────────────────────
const TRANG_THAI_UV_BADGE = {
  ChoXet: { label: 'Chờ xét', cls: 'bg-blue-100 text-blue-700' },
  Loai:   { label: 'Loại',    cls: 'bg-red-100 text-red-600' },
};

// ─── Slide-in animation variant (from right) ─────────────────────────────────
const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 20 },
};

/**
 * DanhSachUngVienView
 * Inline drill-down component — renders inside the main flex-1 area.
 *
 * Props:
 *   dot        — the selected DotHocBong object
 *   onBack     — callback: navigate back to list (also restores sidebar)
 */
const DanhSachUngVienView = ({ dot, onBack }) => {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [filterTrangThai, setFilterTrangThai] = useState('TatCa');

  useEffect(() => {
    const fetchData = async () => {
      setDangTai(true);
      try {
        const res = await dotHocBongService.getDanhSachUngVien(dot.maDot);
        if (res.success) {
          setDanhSach(res.data || []);
        } else {
          toast.error(res.message || 'Không thể tải danh sách ứng viên.');
        }
      } catch {
        toast.error('Lỗi kết nối khi tải danh sách ứng viên.');
      } finally {
        setDangTai(false);
      }
    };
    fetchData();
  }, [dot.maDot]);

  // ─── Local filter (no API call) ───────────────────────────────────────────
  const filtered = filterTrangThai === 'TatCa'
    ? danhSach
    : danhSach.filter(uv => uv.trangThai === filterTrangThai);

  const soChoXet = danhSach.filter(uv => uv.trangThai === 'ChoXet').length;
  const soLoai   = danhSach.filter(uv => uv.trangThai === 'Loai').length;

  return (
    <motion.div
      key="detail-view"
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex flex-col h-full"
    >
      {/* ── Detail Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-white shrink-0">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="bg-blue-50 p-2 rounded-xl shrink-0">
            <Users className="text-blue-600 w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-800 truncate">
              Danh sách ứng viên — {dot.loaiDot}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              HK {dot.hocKy} · {dot.namHoc}
              {' · '}
              <span className="text-blue-600 font-semibold">{soChoXet} chờ xét</span>
              {' · '}
              <span className="text-red-500 font-semibold">{soLoai} loại</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-slate-500 mr-1">Lọc:</span>
        {[
          { val: 'TatCa',  label: 'Tất cả',  count: danhSach.length },
          { val: 'ChoXet', label: 'Chờ xét', count: soChoXet },
          { val: 'Loai',   label: 'Loại',    count: soLoai },
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => setFilterTrangThai(opt.val)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              filterTrangThai === opt.val
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label} ({opt.count})
          </button>
        ))}
      </div>

      {/* ── Table area (independent scroll) ───────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {dangTai ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Không có dữ liệu ứng viên.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {['#', 'Mã SV', 'Họ tên', 'GPA', 'Điểm HT', 'Điểm RL', 'Trạng thái', 'Ghi chú'].map(h => (
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
              {filtered.map((uv, idx) => {
                const badge = TRANG_THAI_UV_BADGE[uv.trangThai] || {
                  label: uv.trangThai,
                  cls: 'bg-gray-100 text-gray-600',
                };
                return (
                  <tr key={`${uv.maSV}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-600 whitespace-nowrap">{uv.maSV}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">{uv.hoTen}</td>
                    <td className="px-4 py-2.5 text-slate-700">{uv.gpa?.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-700">{uv.diemHocTap?.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-700">{uv.diemRenLuyen}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td
                      className="px-4 py-2.5 text-slate-500 text-xs max-w-[220px] truncate"
                      title={uv.ghiChu || ''}
                    >
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
  );
};

export default DanhSachUngVienView;
