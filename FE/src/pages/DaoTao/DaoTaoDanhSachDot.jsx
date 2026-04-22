import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileSpreadsheet, Loader2, BookOpen, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import dotHocBongService from '../../services/dotHocBongService.js';

const TRANG_THAI_LABEL = {
  KhoiTao: { label: 'Khởi tạo', color: 'bg-blue-100 text-blue-700' },
  DangXetDuyet: { label: 'Đang xét duyệt', color: 'bg-yellow-100 text-yellow-700' },
  DuKien: { label: 'Dự kiến', color: 'bg-purple-100 text-purple-700' },
  ChinhThuc: { label: 'Chính thức', color: 'bg-green-100 text-green-700' },
};

const DaoTaoDanhSachDot = () => {
  const navigate = useNavigate();
  const [danhSachDot, setDanhSachDot] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  const taiDanhSach = async () => {
    setDangTai(true);
    try {
      const res = await dotHocBongService.getDanhSachDot();
      if (res.success) {
        // Chỉ hiển thị đợt có trạng thái KhoiTao — đây là đích import điểm
        const dotKhoiTao = (res.data || []).filter(
          (d) => d.trangThai === 'KhoiTao'
        );
        setDanhSachDot(dotKhoiTao);
      } else {
        toast.error(res.message || 'Không thể tải danh sách đợt.');
      }
    } catch (err) {
      toast.error('Lỗi kết nối. Vui lòng kiểm tra Backend đang chạy.');
      console.error(err);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  const chuyenSangImport = (dot) => {
    navigate(`/dao-tao/import/${dot.maDot}`, {
      state: {
        maDot: dot.maDot,
        loaiDot: dot.loaiDot,
        hocKy: dot.hocKy,
        namHoc: dot.namHoc,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 p-2.5 rounded-xl">
            <FileSpreadsheet className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Cung cấp Điểm Học Vụ</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Chọn đợt học bổng để nhập dữ liệu điểm
            </p>
          </div>
        </div>
        <button
          onClick={taiDanhSach}
          disabled={dangTai}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${dangTai ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Loading */}
      {dangTai && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!dangTai && danhSachDot.length === 0 && (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-12 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">Không có đợt nào đang mở</h3>
          <p className="text-sm text-slate-500">
            Chỉ hiển thị các đợt có trạng thái <span className="font-semibold text-blue-600">Khởi tạo</span>.
            Vui lòng liên hệ Phòng CTSV để tạo đợt mới.
          </p>
        </div>
      )}

      {/* Grid Cards */}
      {!dangTai && danhSachDot.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {danhSachDot.map((dot) => {
            const badge = TRANG_THAI_LABEL[dot.trangThai] || {
              label: dot.trangThai,
              color: 'bg-gray-100 text-gray-600',
            };
            return (
              <div
                key={dot.maDot}
                className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-blue-100 transition-all duration-200"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="bg-blue-50 p-2 rounded-xl shrink-0">
                    <BookOpen className="text-blue-600 w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Card Body */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug">
                    {dot.loaiDot}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>HK {dot.hocKy}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <span className="font-medium">{dot.namHoc}</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => chuyenSangImport(dot)}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition active:scale-95"
                >
                  Nhập điểm học vụ
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DaoTaoDanhSachDot;
