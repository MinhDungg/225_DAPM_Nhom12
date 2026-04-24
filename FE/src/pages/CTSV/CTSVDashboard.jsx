import React, { useState, useEffect } from 'react';
import { Send, Landmark, Info, Trash2, CalendarClock, AlertTriangle, Loader2 } from 'lucide-react';
import FinalDecisionService from '../../services/finalDecisionService';
import KhieuNaiService from '../../services/khieuNaiService';

const CTSVDashboard = () => {
    const [data, setData] = useState({
        thongTinDot: { hocKy: '', namHoc: '', loaiDot: '', trangThai: '', lyDoTraVe: '' },
        danhSachCho: []
    });
    const [loading, setLoading] = useState(false);

    // Quản lý đa đợt
    const [dsDotHocBong, setDsDotHocBong] = useState([]);
    const [selectedMaDot, setSelectedMaDot] = useState('');

    // 1. Load danh sách đợt khi trang vừa mở
    useEffect(() => {
        const fetchDotHocBong = async () => {
            try {
                const res = await FinalDecisionService.layDsDotHocBong();
                if (res.success && res.data.length > 0) {
                    setDsDotHocBong(res.data);
                    setSelectedMaDot(res.data[0].maDot.toString());
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách đợt:", error);
            }
        };
        fetchDotHocBong();
    }, []);

    // 2. Load dữ liệu khi chọn đợt
    useEffect(() => {
        if (selectedMaDot) {
            fetchData(selectedMaDot);
        }
    }, [selectedMaDot]);

    const fetchData = async (maDot) => {
        setLoading(true);
        try {
            const res = await FinalDecisionService.getToTrinhHieuTruong(maDot);
            if (res.success) {
                setData({
                    thongTinDot: res.data.thongTinDot,
                    danhSachCho: res.data.danhSach.filter(p => p.trangThai === 'HoiDongDuyet' || p.trangThai === 'ChinhThuc')
                });
            } else {
                setData({
                    thongTinDot: { hocKy: '', namHoc: '', loaiDot: '', trangThai: '', lyDoTraVe: '' },
                    danhSachCho: []
                });
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu CTSV", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Trình lên BGH
    const handleTrinhBGH = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn trình danh sách này lên Ban Giám Hiệu?')) return;

        setLoading(true);
        try {
            // Kiểm tra khiếu nại
            const khieuNaiRes = await KhieuNaiService.layTatCaKhieuNai();
            if (khieuNaiRes.success) {
                const chuaXuLy = khieuNaiRes.data.some(kn => kn.trangThai === 'ChoXuLy');
                if (chuaXuLy) {
                    alert('⚠️ Vẫn còn khiếu nại chưa xử lý. Bạn cần xử lý hết khiếu nại trước khi trình BGH!');
                    setLoading(false);
                    return;
                }
            }

            const res = await FinalDecisionService.trinhHieuTruong(selectedMaDot);
            if (res.success) {
                alert('✅ Trình danh sách lên Ban Giám Hiệu thành công!');
                fetchData(selectedMaDot);
            } else {
                alert(res.message || 'Có lỗi xảy ra khi trình ký.');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    // 4. Xóa hồ sơ
    const handleXoaHoSo = async (maHoSo, hoTen) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ của "${hoTen}" khỏi danh sách?`)) return;

        try {
            const res = await FinalDecisionService.xoaHoSo(maHoSo);
            if (res.success) {
                alert('✅ Đã xóa hồ sơ thành công.');
                fetchData(selectedMaDot);
            } else {
                alert(res.message || 'Xóa hồ sơ thất bại.');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối đến máy chủ.');
        }
    };

    const trangThai = data.thongTinDot?.trangThai;
    const isReadOnly = trangThai === 'ChoPheDuyet' || trangThai === 'ChinhThuc';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header + Dropdown Chọn Đợt */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                        <Landmark size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase">
                            {data.thongTinDot.loaiDot || 'Chọn đợt học bổng'}
                        </h2>
                        <p className="text-sm text-slate-500 font-bold">
                            Học kỳ: {data.thongTinDot.hocKy} | Năm học: {data.thongTinDot.namHoc}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Dropdown chọn đợt */}
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                        <CalendarClock size={18} className="text-blue-500" />
                        <select
                            value={selectedMaDot}
                            onChange={(e) => setSelectedMaDot(e.target.value)}
                            className="bg-transparent outline-none font-bold text-slate-700 cursor-pointer pr-2 text-sm"
                        >
                            {dsDotHocBong.length === 0 ? (
                                <option value="">Đang tải...</option>
                            ) : (
                                dsDotHocBong.map((dot) => (
                                    <option key={dot.maDot} value={dot.maDot}>
                                        {dot.loaiDot} (Kỳ {dot.hocKy} - {dot.namHoc})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Nút trình ký */}
                    <button
                        onClick={handleTrinhBGH}
                        disabled={loading || isReadOnly || data.danhSachCho.length === 0}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm
                            ${(loading || isReadOnly || data.danhSachCho.length === 0)
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:shadow-lg hover:bg-indigo-700'}`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {trangThai === 'ChoPheDuyet' ? 'ĐÃ TRÌNH BGH' :
                            trangThai === 'ChinhThuc' ? 'ĐÃ CHỐT' : 'LẬP TỜ TRÌNH & TRÌNH BGH'}
                    </button>
                </div>
            </div>

            {/* Thông báo Lý do trả về từ Hiệu trưởng */}
            {data.thongTinDot.lyDoTraVe && trangThai === 'DangXetDuyet' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-xl text-red-600 mt-0.5">
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <h4 className="font-black text-red-800 text-sm uppercase tracking-wider mb-1">
                            ⚠️ Hồ sơ bị trả lại từ Ban Giám Hiệu
                        </h4>
                        <p className="text-red-700 font-medium text-sm">
                            <strong>Lý do:</strong> {data.thongTinDot.lyDoTraVe}
                        </p>
                        <p className="text-red-500 text-xs mt-2">
                            Vui lòng rà soát, chỉnh sửa hoặc xóa các hồ sơ không hợp lệ, sau đó trình lại.
                        </p>
                    </div>
                </div>
            )}

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info size={18} className="text-blue-500" />
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                            Danh sách Hội đồng đã duyệt ({data.danhSachCho.length} hồ sơ)
                        </h3>
                    </div>
                    {trangThai && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                            ${trangThai === 'ChinhThuc' ? 'bg-emerald-100 text-emerald-700' :
                                trangThai === 'ChoPheDuyet' ? 'bg-amber-100 text-amber-700' :
                                    'bg-blue-100 text-blue-700'}`}>
                            {trangThai === 'ChinhThuc' ? 'Đã phê duyệt' :
                                trangThai === 'ChoPheDuyet' ? 'Đang chờ BGH' :
                                    trangThai === 'DangXetDuyet' ? 'Đang xét duyệt' : trangThai}
                        </span>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Mã SV / Họ Tên</th>
                                <th className="p-4">Lớp / Khoa</th>
                                <th className="p-4 text-center">GPA / Học Tập</th>
                                <th className="p-4 text-center">Rèn Luyện</th>
                                <th className="p-4 text-center">Điểm F</th>
                                <th className="p-4">Xếp Loại</th>
                                <th className="p-4 text-right">Số Tiền (VNĐ)</th>
                                {!isReadOnly && <th className="p-4 text-center">Thao Tác</th>}
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {data.danhSachCho.length === 0 ? (
                                <tr>
                                    <td colSpan={isReadOnly ? 7 : 8} className="text-center p-8 text-slate-400 font-medium">
                                        Chưa có hồ sơ nào được Hội đồng duyệt cho đợt này.
                                    </td>
                                </tr>
                            ) : (
                                data.danhSachCho.map((item) => (
                                    <tr key={item.maHoSo} className="border-t border-slate-50 hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{item.maSV}</div>
                                            <div className="text-xs text-slate-500">{item.hoTen}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-slate-700">{item.tenLop}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">{item.tenKhoa}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="font-black text-blue-600">
                                                {item.gpa ? Number(item.gpa).toFixed(2) : '0.00'}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                HT: {item.diemHocTap ? Number(item.diemHocTap).toFixed(2) : '0.00'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-bold text-slate-700">{item.diemRenLuyen}</td>
                                        <td className="p-4 text-center">
                                            {item.coDiemF ?
                                                <span className="text-red-500 font-black">CÓ</span> :
                                                <span className="text-slate-300">Không</span>
                                            }
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-[11px] font-black uppercase">
                                                {item.xepLoaiHB}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-black text-slate-800">
                                            {item.soTien?.toLocaleString('vi-VN')}
                                        </td>
                                        {!isReadOnly && (
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleXoaHoSo(item.maHoSo, item.hoTen)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                    title="Xóa hồ sơ này"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CTSVDashboard;