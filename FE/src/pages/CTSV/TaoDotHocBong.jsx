import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircle, Loader2 } from 'lucide-react';
import dotHocBongService from '../../services/dotHocBongService.js';

const NAM_HOC_OPTIONS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
const HOC_KY_OPTIONS = [1, 2, 3];
const LOAI_DOT_OPTIONS = [
  'Khuyến khích học tập',
  'Học bổng tài năng',
  'Học bổng hỗ trợ',
];

const TaoDotHocBong = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    loaiDot: LOAI_DOT_OPTIONS[0],
    hocKy: 1,
    namHoc: '2025-2026',
  });
  const [dangGui, setDangGui] = useState(false);

  const xuLyThayDoi = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'hocKy' ? Number(value) : value,
    }));
  };

  const xuLySubmit = async (e) => {
    e.preventDefault();

    if (!form.namHoc.trim()) {
      toast.error('Vui lòng nhập năm học.');
      return;
    }

    setDangGui(true);
    try {
      const payload = {
        loaiDot: form.loaiDot,
        hocKy: form.hocKy,
        namHoc: form.namHoc.trim(),
      };

      const res = await dotHocBongService.createDotHocBong(payload);

      if (res.success) {
        toast.success(res.message || 'Tạo đợt học bổng thành công!');
        setTimeout(() => navigate('/ctsv'), 1500);
      } else {
        toast.error(res.message || 'Tạo đợt thất bại.');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || 'Lỗi hệ thống.';
      toast.error(msg);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-lg bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <PlusCircle className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tạo Đợt Học Bổng</h1>
            <p className="text-sm text-slate-500 mt-0.5">Khởi tạo đợt xét học bổng mới cho học kỳ</p>
          </div>
        </div>

        <form onSubmit={xuLySubmit} className="space-y-5">
          {/* Loại đợt */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Loại đợt xét
            </label>
            <select
              name="loaiDot"
              value={form.loaiDot}
              onChange={xuLyThayDoi}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            >
              {LOAI_DOT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Học kỳ */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Học kỳ
            </label>
            <select
              name="hocKy"
              value={form.hocKy}
              onChange={xuLyThayDoi}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            >
              {HOC_KY_OPTIONS.map((hk) => (
                <option key={hk} value={hk}>
                  Học kỳ {hk}
                </option>
              ))}
            </select>
          </div>

          {/* Năm học */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Năm học
            </label>
            <select
              name="namHoc"
              value={form.namHoc}
              onChange={xuLyThayDoi}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            >
              {NAM_HOC_OPTIONS.map((nh) => (
                <option key={nh} value={nh}>
                  {nh}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">VD: 2025-2026</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/ctsv')}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-50 transition active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangGui}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95"
            >
              {dangGui ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Tạo đợt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaoDotHocBong;
