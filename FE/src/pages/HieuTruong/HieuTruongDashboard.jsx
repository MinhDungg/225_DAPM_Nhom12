import React, { useState, useEffect } from 'react';
import { FileText, Users, DollarSign, Eye, CheckCircle, XCircle, Loader2, AlertCircle, CalendarClock } from 'lucide-react';
import api from '../../utils/api';
import FinalDecisionService from '../../services/finalDecisionService';

const HieuTruongDashboard = () => {
    // State cho danh sách các đợt học bổng
    const [dsDotHocBong, setDsDotHocBong] = useState([]);
    const [selectedMaDot, setSelectedMaDot] = useState('');

    // State cho dữ liệu chi tiết của 1 đợt
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [showList, setShowList] = useState(false);

    // Modal trả hồ sơ
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [lyDoTraVe, setLyDoTraVe] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredList = (data?.danhSach || []).filter(hs => {
        const q = searchQuery.toLowerCase();
        return (
            (hs.maSV && String(hs.maSV).toLowerCase().includes(q)) ||
            (hs.hoTen && String(hs.hoTen).toLowerCase().includes(q)) ||
            (hs.tenLop && String(hs.tenLop).toLowerCase().includes(q)) ||
            (hs.tenKhoa && String(hs.tenKhoa).toLowerCase().includes(q))
        );
    });

    // 1. Gọi API lấy danh sách đợt học bổng khi trang vừa load
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
                console.error("Lỗi lấy danh sách đợt học bổng:", error);
            }
        };
        fetchDotHocBong();
    }, []);

    // 2. Tự động gọi API lấy dữ liệu Tờ trình khi selectedMaDot thay đổi
    useEffect(() => {
        if (selectedMaDot) {
            fetchRoundData(selectedMaDot);
        }
    }, [selectedMaDot]);

    const fetchRoundData = async (maDot) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/hieutruong/tong-hop/${maDot}`);
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setData(null);
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu tờ trình:", error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    // 3. Hàm xử lý Phê duyệt
    const handleApprove = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn CHỐT SỔ danh sách này? Hành động này không thể hoàn tác.")) return;
        setIsApproving(true);
        try {
            const res = await api.put(`/api/hieutruong/pheduyet/${selectedMaDot}`);
            if (res.data.success) {
                alert("✅ Phê duyệt thành công! Danh sách đã được chuyển sang Tài chính.");
                fetchRoundData(selectedMaDot);
            } else {
                alert(res.data.message || "Phê duyệt thất bại.");
            }
        } catch (error) {
            alert("Có lỗi xảy ra khi phê duyệt.");
        } finally {
            setIsApproving(false);
        }
    };

    // 4. Hàm xử lý Trả hồ sơ
    const handleReject = async () => {
        if (!lyDoTraVe.trim()) {
            alert("Vui lòng nhập lý do trả hồ sơ.");
            return;
        }

        setIsRejecting(true);
        try {
            const res = await FinalDecisionService.traHoSo(selectedMaDot, lyDoTraVe);
            if (res.success) {
                alert("✅ Đã trả hồ sơ về CTSV kèm lý do.");
                setShowRejectModal(false);
                setLyDoTraVe('');
                fetchRoundData(selectedMaDot);
            } else {
                alert(res.message || "Trả hồ sơ thất bại.");
            }
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi trả hồ sơ.");
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header & Dropdown Chọn Đợt */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Ban Giám hiệu</h2>
                    <p className="text-slate-500 mt-1">Phê duyệt tờ trình và ban hành quyết định học bổng chính thức.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                        <CalendarClock size={20} />
                    </div>
                    <select
                        value={selectedMaDot}
                        onChange={(e) => setSelectedMaDot(e.target.value)}
                        className="bg-transparent outline-none font-bold text-slate-700 cursor-pointer pr-4"
                    >
                        {dsDotHocBong.length === 0 ? (
                            <option value="">Đang tải đợt học bổng...</option>
                        ) : (
                            dsDotHocBong.map((dot) => (
                                <option key={dot.maDot} value={dot.maDot}>
                                    {dot.loaiDot} (Kỳ {dot.hocKy} - {dot.namHoc})
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">Đang tải dữ liệu tờ trình...</p>
                </div>
            ) : !data ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
                    <AlertCircle className="text-slate-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-slate-700">Không có dữ liệu</h3>
                    <p className="text-slate-500 mt-2">Chưa có danh sách dự kiến nào được trình lên cho đợt học bổng này.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header Tờ trình */}
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">
                                    Tờ trình cấp xét {data.thongTinDot?.loaiDot}
                                </h3>
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-0.5">
                                    Học kỳ {data.thongTinDot?.hocKy} - Năm học {data.thongTinDot?.namHoc}
                                </p>
                            </div>
                        </div>
                        <span className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${data.thongTinDot?.trangThai === 'ChinhThuc'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                            {data.thongTinDot?.trangThai === 'ChinhThuc' ? 'Đã phê duyệt chính thức' : 'Đang chờ BGH duyệt'}
                        </span>
                    </div>

                    <div className="p-10 space-y-8">
                        {/* Box Thống kê */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Tóm tắt phân bổ</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                                        <div className="flex items-center gap-2 font-bold text-slate-600"><Users size={18} /> Tổng sinh viên đạt:</div>
                                        <span className="text-xl font-black text-slate-900">{data.tongSinhVien}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 font-bold text-slate-600"><DollarSign size={18} /> Tổng kinh phí dự kiến:</div>
                                        <span className="text-xl font-black text-blue-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.tongKinhPhi)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Nút Toggle xem danh sách */}
                            <div
                                onClick={() => setShowList(!showList)}
                                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group p-6"
                            >
                                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:text-blue-600 text-slate-400 transition-colors">
                                    <Eye size={28} />
                                </div>
                                <span className="font-bold text-slate-600 group-hover:text-blue-700">
                                    {showList ? "Đóng danh sách" : "Xem chi tiết danh sách trình duyệt"}
                                </span>
                            </div>
                        </div>

                        {/* Bảng Danh sách sinh viên */}
                        {showList && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
                                <div className="p-4 border-b border-slate-200 bg-white">
                                    <input
                                        type="text"
                                        placeholder="Tìm theo MSSV, Tên, Lớp, Khoa..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full md:w-80 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <table className="w-full text-left bg-white">
                                    <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">Mã SV / Họ Tên</th>
                                            <th className="p-4">Lớp / Khoa</th>
                                            <th className="p-4 text-center">GPA / Học Tập</th>
                                            <th className="p-4 text-center">Rèn Luyện</th>
                                            <th className="p-4 text-center">Điểm F</th>
                                            <th className="p-4">Xếp Loại</th>
                                            <th className="p-4 text-right">Số Tiền (VNĐ)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredList.length === 0 ? (
                                            <tr><td colSpan="7" className="text-center p-4 text-slate-500">Chưa có sinh viên nào.</td></tr>
                                        ) : (
                                            filteredList.map((sv) => (
                                                <tr key={sv.maHoSo} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-700 font-medium">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-800">{sv.maSV}</div>
                                                        <div className="text-xs text-slate-500">{sv.hoTen}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-slate-700">{sv.tenLop}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase font-bold">{sv.tenKhoa}</div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="font-black text-blue-600">{sv.gpa != null ? Number(sv.gpa).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}</div>
                                                        <div className="text-[10px] text-slate-400">HT: {sv.diemHocTap != null ? Number(sv.diemHocTap).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}</div>
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-slate-700">{sv.diemRenLuyen}</td>
                                                    <td className="p-4 text-center">
                                                        {sv.coDiemF ?
                                                            <span className="text-red-500 font-black">CÓ</span> :
                                                            <span className="text-slate-300">Không</span>
                                                        }
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1.5 rounded-lg text-[11px] font-black uppercase ${sv.xepLoaiHB === 'Xuất sắc' ? 'bg-amber-100 text-amber-700' :
                                                                sv.xepLoaiHB === 'Giỏi' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {sv.xepLoaiHB || 'Chưa xét'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-black text-slate-800">
                                                        {sv.mucHocBong != null ? sv.mucHocBong.toLocaleString('vi-VN') : (sv.soTien != null ? sv.soTien.toLocaleString('vi-VN') : '-')}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Các nút Action (Chỉ hiển thị khi đợt chưa chính thức) */}
                        {data.thongTinDot?.trangThai !== 'ChinhThuc' && (
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleApprove}
                                    disabled={isApproving}
                                    className={`flex-1 text-white py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95
                                        ${isApproving ? 'bg-slate-400 shadow-none cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                                >
                                    {isApproving ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} />}
                                    {isApproving ? 'Đang chốt sổ...' : 'Phê duyệt & Ban hành Quyết định'}
                                </button>

                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="flex-1 border-2 border-red-100 text-red-500 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 hover:bg-red-50 active:scale-95"
                                >
                                    <XCircle size={22} /> Trả hồ sơ / Yêu cầu giải trình
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Trả hồ sơ */}
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