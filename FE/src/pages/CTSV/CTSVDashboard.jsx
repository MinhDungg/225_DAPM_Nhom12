import React, { useState, useEffect } from 'react';
import { Send, Landmark, Info, Trash2, CalendarClock, AlertTriangle, Loader2, Megaphone, FastForward } from 'lucide-react';
import FinalDecisionService from '../../services/finalDecisionService';
import KhieuNaiService from '../../services/khieuNaiService';
import { exportCTSVExcel, exportCTSVPdf } from '../../utils/exportUtils';

const CTSVDashboard = () => {
    const [data, setData] = useState({
        thongTinDot: { hocKy: '', namHoc: '', loaiDot: '', trangThai: '', lyDoTraVe: '' },
        danhSachCho: []
    });
    
    const removeAccents = (str) => {
        if (!str) return '';
        return String(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };
    const [loading, setLoading] = useState(false);

    const [dsDotHocBong, setDsDotHocBong] = useState([]);
    const [exporting, setExporting] = useState(false);
    const handleExport = async (fn) => {
        setExporting(true);
        try { await fn(); }
        catch (e) { alert('Lỗi xuất file: ' + e.message); }
        finally { setExporting(false); }
    };

    const [selectedMaDot, setSelectedMaDot] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDotHocBong = async () => {
            try {
                const res = await FinalDecisionService.layDsDotHocBong();
                if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
                    setDsDotHocBong(res.data);
                    setSelectedMaDot(res.data[0]?.maDot?.toString() || '');
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách đợt:", error);
            }
        };
        fetchDotHocBong();
    }, []);

    useEffect(() => {
        if (selectedMaDot) {
            fetchData(selectedMaDot);
        }
    }, [selectedMaDot]);

    const fetchData = async (maDot) => {
        setLoading(true);
        try {
            const res = await FinalDecisionService.getToTrinhHieuTruong(maDot);
            if (res && res.success && res.data) {
                const thongTin = res.data.thongTinDot || { hocKy: '', namHoc: '', loaiDot: '', trangThai: '', lyDoTraVe: '' };
                const danhSach = Array.isArray(res.data.danhSach) ? res.data.danhSach : [];
                setData({
                    thongTinDot: thongTin,
                    danhSachCho: danhSach.filter(p => p && (p.trangThai === 'HoiDongDuyet' || p.trangThai === 'ChinhThuc'))
                });
            } else {
                setData({
                    thongTinDot: { hocKy: '', namHoc: '', loaiDot: '', trangThai: '', lyDoTraVe: '' },
                    danhSachCho: []
                });
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu CTSV", error);
            setData({
                thongTinDot: { hocKy: '', namHoc: '', loaiDot: '', trangThai: '', lyDoTraVe: '' },
                danhSachCho: []
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTrinhBGH = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn trình danh sách này lên Ban Giám Hiệu?')) return;

        setLoading(true);
        try {
            const khieuNaiRes = await KhieuNaiService.layTatCaKhieuNai();
            if (khieuNaiRes.success) {
                const chuaXuLy = khieuNaiRes.data.some(kn => kn.trangThai === 'ChoXuLy');
                if (chuaXuLy) {
                    alert('⚠️ Vẫn còn khiếu nại chưa xử lý. Bạn cần xử lý hết khiếu nại trước khi trình BGH!');
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
            const serverMessage = error?.response?.data?.message || error?.response?.data?.Message || error?.message;
            alert(serverMessage || 'Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

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
            alert(error.response?.data?.message || 'Lỗi kết nối đến máy chủ.');
        }
    };

    const handleCongBo = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn công bố danh sách dự kiến để lấy ý kiến sinh viên?')) return;
        setLoading(true);
        try {
            const res = await FinalDecisionService.congBoLayYKien(selectedMaDot);
            if (res.success) {
                alert('✅ Đã công bố danh sách thành công!');
                fetchData(selectedMaDot);
            } else {
                alert(res.message || 'Có lỗi xảy ra.');
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    const handleTuaNhanh = async () => {
        if (!window.confirm('Dùng cho DEMO: Tua nhanh thời gian 10 ngày để kết thúc lấy ý kiến?')) return;
        setLoading(true);
        try {
            const res = await FinalDecisionService.tuaNhanhDemo(selectedMaDot);
            if (res.success) {
                alert('✅ Đã tua nhanh thời gian thành công!');
                fetchData(selectedMaDot);
            } else {
                alert(res.message || 'Có lỗi xảy ra.');
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    const trangThai = data.thongTinDot?.trangThai;
    const isReadOnly = trangThai === 'ChoPheDuyet' || trangThai === 'ChinhThuc';

    const filteredList = (data?.danhSachCho || []).filter(hs => {
        if (!hs) return false;
        const q = removeAccents(searchQuery);
        return (
            (hs.maSV && removeAccents(hs.maSV).includes(q)) ||
            (hs.hoTen && removeAccents(hs.hoTen).includes(q)) ||
            (hs.tenLop && removeAccents(hs.tenLop).includes(q)) ||
            (hs.tenKhoa && removeAccents(hs.tenKhoa).includes(q))
        );
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Control Panel */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Landmark size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">
                            {data?.thongTinDot?.loaiDot || 'Chọn đợt học bổng'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Học kỳ: <span className="font-medium text-gray-700">{data?.thongTinDot?.hocKy || '-'}</span> |
                            Năm học: <span className="font-medium text-gray-700">{data?.thongTinDot?.namHoc || '-'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Dropdown chọn đợt - Giao diện Form Input chuẩn */}
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 w-full lg:w-auto hover:border-blue-400 transition-colors focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500">
                        <CalendarClock size={16} className="text-gray-400" />
                        <select
                            value={selectedMaDot}
                            onChange={(e) => setSelectedMaDot(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-full lg:min-w-[200px] cursor-pointer focus:ring-0 p-0"
                        >
                            {dsDotHocBong.length === 0 ? (
                                <option value="">Đang tải dữ liệu...</option>
                            ) : (
                                dsDotHocBong.map((dot) => dot ? (
                                    <option key={dot.maDot || Math.random()} value={dot.maDot || ''}>
                                        {dot.loaiDot || 'N/A'} (Kỳ {dot.hocKy || '-'} - {dot.namHoc || '-'})
                                    </option>
                                ) : null)
                            )}
                        </select>
                    </div>

                    {trangThai === 'DuKien' && (
                        <button
                            onClick={handleCongBo}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700 shadow-sm w-full lg:w-auto"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
                            Công Bố Danh Sách
                        </button>
                    )}

                    {trangThai === 'CongBoLayYKien' && (
                        <button
                            onClick={handleTuaNhanh}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors bg-orange-500 text-white hover:bg-orange-600 shadow-sm w-full lg:w-auto"
                            title="Nút dành cho Demo"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <FastForward size={16} />}
                            Tua Nhanh 10 Ngày
                        </button>
                    )}

                    {/* Nút trình ký */}
                    <button
                        onClick={handleTrinhBGH}
                        disabled={loading || isReadOnly || (data?.danhSachCho || []).length === 0 || trangThai !== 'LayYKienHoanTat'}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors w-full lg:w-auto
                            ${(loading || isReadOnly || (data?.danhSachCho || []).length === 0 || trangThai !== 'LayYKienHoanTat')
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent'}`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {trangThai === 'ChoPheDuyet' ? 'ĐÃ TRÌNH BGH' :
                            trangThai === 'ChinhThuc' ? 'ĐÃ CHỐT' : 'TRÌNH BGH'}
                    </button>
                </div>
            </div>

            {/* Thông báo Lý do trả về từ Hiệu trưởng */}
            {data?.thongTinDot?.lyDoTraVe && trangThai === 'DangXetDuyet' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="text-red-600 shrink-0 mt-0.5">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-800 text-sm mb-1">
                            Hồ sơ bị trả lại từ Ban Giám Hiệu
                        </h4>
                        <p className="text-red-700 text-sm mb-1">
                            <span className="font-medium">Lý do:</span> {data?.thongTinDot?.lyDoTraVe}
                        </p>
                        <p className="text-red-600/80 text-xs">
                            Vui lòng rà soát, chỉnh sửa hoặc xóa các hồ sơ không hợp lệ, sau đó thực hiện trình lại.
                        </p>
                    </div>
                </div>
            )}

            {/* BẢNG DỮ LIỆU CHUẨN ADMIN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header Section */}
                <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Info size={18} className="text-gray-400" /><div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleExport(() => exportCTSVExcel(selectedMaDot))} disabled={exporting}
                                style={{ background: '#1D6F42', color: '#fff', padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                📊 Xuất Excel
                            </button>
                            <button onClick={() => handleExport(() => exportCTSVPdf(selectedMaDot))} disabled={exporting}
                                style={{ background: '#C00', color: '#fff', padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                📄 Xuất PDF
                            </button>
                        </div>

                        <h3 className="font-semibold text-gray-900 text-base">
                            Danh sách Hội đồng đã duyệt
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({filteredList.length} hồ sơ)
                            </span>
                        </h3>
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm theo MSSV, Tên, Lớp, Khoa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full md:w-64"
                    />
                    {trangThai && (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border
                            ${trangThai === 'ChinhThuc' ? 'bg-green-50 text-green-700 border-green-200' :
                                trangThai === 'ChoPheDuyet' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    trangThai === 'LayYKienHoanTat' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                        trangThai === 'CongBoLayYKien' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            trangThai === 'DuKien' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {trangThai === 'ChinhThuc' ? 'Đã phê duyệt' :
                                trangThai === 'ChoPheDuyet' ? 'Đang chờ BGH' :
                                    trangThai === 'LayYKienHoanTat' ? 'Hoàn tất lấy ý kiến' :
                                        trangThai === 'CongBoLayYKien' ? 'Đang lấy ý kiến' :
                                            trangThai === 'DuKien' ? 'Danh sách dự kiến' :
                                                trangThai === 'DangXetDuyet' ? 'Đang xét duyệt' : trangThai}
                        </span>
                    )}
                </div>

                {/* Table Data Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Mã SV / Họ Tên</th>
                                <th className="px-6 py-3">Lớp / Khoa</th>
                                <th className="px-6 py-3 text-right">GPA</th>
                                <th className="px-6 py-3 text-right">Học Tập</th>
                                <th className="px-6 py-3 text-center">Rèn Luyện</th>
                                <th className="px-6 py-3 text-center">Điểm F</th>
                                <th className="px-6 py-3">Xếp Loại</th>
                                <th className="px-6 py-3 text-right">Số Tiền (VNĐ)</th>
                                {!isReadOnly && <th className="px-6 py-3 text-center">Thao Tác</th>}
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={isReadOnly ? 8 : 9} className="text-center py-12 text-gray-500">
                                        Chưa có hồ sơ nào được Hội đồng duyệt cho đợt này.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((item) => item ? (
                                    <tr key={item.maHoSo || Math.random()} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{item.maSV || '-'}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.hoTen || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700">{item.tenLop || '-'}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.tenKhoa || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            {item.gpa ? Number(item.gpa).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {item.diemHocTap ? Number(item.diemHocTap).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.diemRenLuyen || '0'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.coDiemF ?
                                                <span className="text-red-600 font-medium">Có</span> :
                                                <span className="text-gray-400">-</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                                                {item.xepLoaiHB || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {item.soTien != null ? Number(item.soTien).toLocaleString('vi-VN') : '-'}
                                        </td>
                                        {!isReadOnly && (
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleXoaHoSo(item.maHoSo, item.hoTen)}
                                                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                                    title="Xóa hồ sơ"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ) : null)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CTSVDashboard;