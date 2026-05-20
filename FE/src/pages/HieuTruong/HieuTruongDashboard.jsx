import React, { useState, useEffect } from 'react';
import {
    FileText, Users, DollarSign, Eye, CheckCircle, XCircle,
    Loader2, AlertCircle, CalendarClock, Shield, Star, Info
} from 'lucide-react';
import api from '../../utils/api';
import FinalDecisionService from '../../services/finalDecisionService';

const HieuTruongDashboard = () => {
    const [dsDotHocBong, setDsDotHocBong] = useState([]);
    const [selectedMaDot, setSelectedMaDot] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [lyDoTraVe, setLyDoTraVe] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const removeAccents = (str) => {
        if (!str) return '';
        return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    const filteredList = (data?.danhSach || []).filter(hs => {
        const q = removeAccents(searchQuery);
        return (
            (hs.maSV && removeAccents(hs.maSV).includes(q)) ||
            (hs.hoTen && removeAccents(hs.hoTen).includes(q)) ||
            (hs.tenLop && removeAccents(hs.tenLop).includes(q)) ||
            (hs.tenKhoa && removeAccents(hs.tenKhoa).includes(q))
        );
    });

    useEffect(() => {
        const fetchDotHocBong = async () => {
            try {
                const response = await api.get('/api/dothocbong');
                if (response.data.success && response.data.data.length > 0) {
                    const dsDot = response.data.data;
                    setDsDotHocBong(dsDot);
                    setSelectedMaDot(dsDot[0].maDot.toString());
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách đợt học bổng:', error);
            }
        };
        fetchDotHocBong();
    }, []);

    useEffect(() => {
        if (selectedMaDot) fetchRoundData(selectedMaDot);
    }, [selectedMaDot]);

    const fetchRoundData = async (maDot) => {
        setLoading(true);
        setShowList(false);
        try {
            const response = await api.get(`/api/hieutruong/tong-hop/${maDot}`);
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setData(null);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu tờ trình:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn CHỐT SỔ danh sách này? Hành động này không thể hoàn tác.')) return;
        setIsApproving(true);
        try {
            const res = await api.put(`/api/hieutruong/pheduyet/${selectedMaDot}`);
            if (res.data.success) {
                alert('✅ Phê duyệt thành công! Danh sách đã được chuyển sang Tài chính.');
                fetchRoundData(selectedMaDot);
            } else {
                alert(res.data.message || 'Phê duyệt thất bại.');
            }
        } catch {
            alert('Có lỗi xảy ra khi phê duyệt.');
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!lyDoTraVe.trim()) { alert('Vui lòng nhập lý do trả hồ sơ.'); return; }
        setIsRejecting(true);
        try {
            const res = await FinalDecisionService.traHoSo(selectedMaDot, lyDoTraVe);
            if (res.success) {
                alert('✅ Đã trả hồ sơ về CTSV kèm lý do.');
                setShowRejectModal(false);
                setLyDoTraVe('');
                fetchRoundData(selectedMaDot);
            } else {
                alert(res.message || 'Trả hồ sơ thất bại.');
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi trả hồ sơ.');
        } finally {
            setIsRejecting(false);
        }
    };

    const trangThai = data?.thongTinDot?.trangThai;
    const isChinhThuc = trangThai === 'ChinhThuc';

    // Tính tổng tiền học bổng thực tế từ danhSach (mucHocBong do KHTC import vào DB)
    const tongTienThucTe = (data?.danhSach || []).reduce(
        (sum, sv) => sum + (sv.mucHocBong ? Number(sv.mucHocBong) : 0), 0
    );

    const trangThaiLabel = {
        ChinhThuc: { text: 'Đã phê duyệt', cls: 'bg-green-50 text-green-700 border-green-200' },
        ChoPheDuyet: { text: 'Đang chờ BGH', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
        DangXetDuyet: { text: 'Đang xét duyệt', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
        LayYKienHoanTat: { text: 'Hoàn tất lấy ý kiến', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
        CongBoLayYKien: { text: 'Đang lấy ý kiến', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        DuKien: { text: 'Danh sách dự kiến', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    };

    const xepLoaiCls = {
        'Xuất sắc': 'bg-amber-100 text-amber-700',
        'Giỏi': 'bg-blue-100 text-blue-700',
        'Khá': 'bg-green-100 text-green-700',
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── HEADER CONTROL PANEL (giống CTSV) ── */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">
                            {data?.thongTinDot?.loaiDot || 'Ban Giám Hiệu'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Học kỳ: <span className="font-medium text-gray-700">{data?.thongTinDot?.hocKy || '-'}</span> |
                            Năm học: <span className="font-medium text-gray-700">{data?.thongTinDot?.namHoc || '-'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Dropdown chọn đợt */}
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 w-full lg:w-auto hover:border-blue-400 transition-colors focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500">
                        <CalendarClock size={16} className="text-gray-400" />
                        <select
                            value={selectedMaDot}
                            onChange={(e) => setSelectedMaDot(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-full lg:min-w-[200px] cursor-pointer focus:ring-0 p-0"
                        >
                            {dsDotHocBong.length === 0 ? (
                                <option value="">Đang tải đợt học bổng...</option>
                            ) : (
                                dsDotHocBong.map((dot) => (
                                    <option key={dot.maDot} value={dot.maDot}>
                                        {dot.loaiDot} (Kỳ {dot.hocKy} – {dot.namHoc})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Nút phê duyệt */}
                    {!isChinhThuc && data && (
                        <button
                            onClick={handleApprove}
                            disabled={isApproving || trangThai !== 'ChoPheDuyet'}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors w-full lg:w-auto
                                ${(isApproving || trangThai !== 'ChoPheDuyet')
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
                        >
                            {isApproving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            {trangThai === 'ChinhThuc' ? 'ĐÃ PHÊ DUYỆT' : 'PHÊ DUYỆT & CHỐT SỔ'}
                        </button>
                    )}

                    {/* Nút trả hồ sơ */}
                    {!isChinhThuc && data && trangThai === 'ChoPheDuyet' && (
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-red-200 text-red-600 hover:bg-red-50 w-full lg:w-auto"
                        >
                            <XCircle size={16} />
                            Trả về CTSV
                        </button>
                    )}
                </div>
            </div>

            {/* ── LOADING ── */}
            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24">
                    <Loader2 size={40} className="animate-spin text-blue-500 mb-3" />
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu tờ trình...</p>
                </div>
            ) : !data ? (
                /* ── EMPTY ── */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                    <AlertCircle size={52} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">Không có dữ liệu</h3>
                    <p className="text-gray-400 mt-2 max-w-sm">
                        Chưa có danh sách nào được CTSV trình lên cho đợt học bổng này.
                    </p>
                </div>
            ) : (
                <>
                    {/* ── TỔNG KẾT ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tổng sinh viên đạt</p>
                                <p className="text-2xl font-black text-gray-900">{data.tongSinhVien ?? 0}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tổng tiền học bổng</p>
                                <p className="text-xl font-black text-emerald-700">
                                    {new Intl.NumberFormat('vi-VN').format(tongTienThucTe)} đ
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {(data?.danhSach || []).filter(sv => sv.mucHocBong).length}/{data?.danhSach?.length ?? 0} SV đã có mức học bổng
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Trạng thái</p>
                                {trangThai && (
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${trangThaiLabel[trangThai]?.cls || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                        {trangThaiLabel[trangThai]?.text || trangThai}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── BẢNG DANH SÁCH (giống CTSV) ── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Info size={18} className="text-gray-400" />
                                <button
                                    onClick={() => setShowList(!showList)}
                                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    <Eye size={16} />
                                    {showList ? 'Đóng danh sách' : 'Xem chi tiết danh sách trình duyệt'}
                                    <span className="text-gray-400 font-normal">({data.danhSach?.length ?? 0} hồ sơ)</span>
                                </button>
                            </div>

                            {showList && (
                                <input
                                    type="text"
                                    placeholder="Tìm theo MSSV, Tên, Lớp, Khoa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full md:w-64"
                                />
                            )}

                            {trangThai && (
                                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${trangThaiLabel[trangThai]?.cls || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                    {trangThaiLabel[trangThai]?.text || trangThai}
                                </span>
                            )}
                        </div>

                        {/* Table Data */}
                        {showList && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3">Mã SV / Họ Tên</th>
                                            <th className="px-6 py-3">Lớp / Khoa</th>
                                            <th className="px-6 py-3 text-right">GPA</th>
                                            <th className="px-6 py-3 text-right">Học Tập</th>
                                            <th className="px-6 py-3 text-center">Rèn Luyện</th>
                                            <th className="px-6 py-3">Xếp Loại</th>
                                            <th className="px-6 py-3 text-right">Số Tiền (VNĐ)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                        {filteredList.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-12 text-gray-500">
                                                    Không có hồ sơ nào.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredList.map((sv) => (
                                                <tr key={sv.maHoSo} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{sv.maSV || '-'}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{sv.hoTen || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-700">{sv.tenLop || '-'}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{sv.tenKhoa || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium">
                                                        {sv.gpa != null ? Number(sv.gpa).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                        {sv.diemHocTap != null ? Number(sv.diemHocTap).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {sv.diemRenLuyen || '0'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {sv.coDiemF
                                                            ? <span className="text-red-600 font-medium">Có</span>
                                                            : <span className="text-gray-400">-</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${xepLoaiCls[sv.xepLoaiHB] || 'bg-gray-100 text-gray-700'}`}>
                                                            {sv.xepLoaiHB === 'Xuất sắc' && <Star size={10} className="inline mr-1 mb-0.5" fill="currentColor" />}
                                                            {sv.xepLoaiHB || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                        {/* Lấy đúng số tiền KHTC đã import từ DB (trường mucHocBong) */}
                                                        {sv.mucHocBong != null
                                                            ? <span>{Number(sv.mucHocBong).toLocaleString('vi-VN')} đ</span>
                                                            : <span className="text-gray-400">-</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {filteredList.length > 0 && (
                                        <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                            <tr>
                                                <td colSpan={7} className="px-6 py-3 text-sm font-semibold text-gray-600">
                                                    Tổng cộng ({filteredList.length} sinh viên)
                                                </td>
                                                <td className="px-6 py-3 text-right font-black text-blue-700 text-sm">
                                                    {Number(
                                                        filteredList.reduce((s, sv) => s + (sv.mucHocBong ? Number(sv.mucHocBong) : 0), 0)
                                                    ).toLocaleString('vi-VN')} đ
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── ĐÃ PHÊ DUYỆT BANNER ── */}
                    {isChinhThuc && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
                            <CheckCircle size={28} className="text-green-600 shrink-0" />
                            <div>
                                <p className="font-bold text-green-800">Đã phê duyệt chính thức</p>
                                <p className="text-green-700 text-sm mt-0.5">
                                    Quyết định học bổng đã được ban hành và chuyển sang Tài chính để thực hiện chi trả.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── MODAL TRẢ HỒ SƠ ── */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-slate-900 mb-2">Trả hồ sơ về CTSV</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Nhập lý do trả hồ sơ. CTSV sẽ nhận được thông báo và có thể chỉnh sửa lại danh sách trước khi trình lại.
                        </p>
                        <textarea
                            value={lyDoTraVe}
                            onChange={(e) => setLyDoTraVe(e.target.value)}
                            placeholder="Ví dụ: Cần kiểm tra lại hồ sơ của SV 23115053122105, điểm rèn luyện chưa khớp..."
                            className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none h-32 transition-all"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowRejectModal(false); setLyDoTraVe(''); }}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isRejecting || !lyDoTraVe.trim()}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                    ${isRejecting || !lyDoTraVe.trim()
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200'}`}
                            >
                                {isRejecting ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                {isRejecting ? 'Đang xử lý...' : 'Xác nhận Trả hồ sơ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HieuTruongDashboard;