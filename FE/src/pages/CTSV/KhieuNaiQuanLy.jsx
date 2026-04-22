import React, { useState, useEffect } from 'react';
import KhieuNaiService from '../../services/khieuNaiService';

const KhieuNaiQuanLy = () => {
    const [danhSach, setDanhSach] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedKhieuNai, setSelectedKhieuNai] = useState(null);
    const [phanHoiText, setPhanHoiText] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await KhieuNaiService.layTatCaKhieuNai();
            if (res.success) {
                setDanhSach(res.data || []);
            } else {
                setError(res.message || 'Không thể tải dữ liệu.');
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách', err);
            setError('Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại Backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPhanHoi = (item) => {
        setSelectedKhieuNai(item);
        setPhanHoiText('');
        setShowModal(true);
    };

    const handleGuiPhanHoi = async (e) => {
        e.preventDefault();
        try {
            const res = await KhieuNaiService.phanHoiKhieuNai(selectedKhieuNai.maKhieuNai, {
                noiDungPhanHoi: phanHoiText
            });

            if (res.success) {
                alert('Phản hồi thành công!');
                setShowModal(false);
                fetchData();
            } else {
                alert(res.message || 'Phản hồi thất bại.');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi phản hồi');
        }
    };

    const soChoXuLy = danhSach.filter(i => i.trangThai === 'ChoXuLy').length;
    const soDaXuLy = danhSach.filter(i => i.trangThai === 'DaXuLy').length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Khiếu nại Sinh viên</h2>
                <p className="text-sm text-slate-500 mt-1">Xem và xử lý các khiếu nại từ sinh viên</p>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng khiếu nại</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{danhSach.length}</p>
                </div>
                <div className="bg-amber-50/70 backdrop-blur-xl border border-amber-100/60 p-5 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Chờ xử lý</p>
                    <p className="text-3xl font-black text-amber-600 mt-1">{soChoXuLy}</p>
                </div>
                <div className="bg-green-50/70 backdrop-blur-xl border border-green-100/60 p-5 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Đã xử lý</p>
                    <p className="text-3xl font-black text-green-600 mt-1">{soDaXuLy}</p>
                </div>
            </div>

            {/* Thông báo lỗi */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Bảng danh sách */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm rounded-3xl overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-slate-800 text-white text-left text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-bold">Mã KN / Mã HS</th>
                            <th className="px-6 py-4 font-bold">Ngày gửi</th>
                            <th className="px-6 py-4 font-bold">Nội dung KN</th>
                            <th className="px-6 py-4 font-bold">Trạng thái</th>
                            <th className="px-6 py-4 font-bold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-400">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    Đang tải dữ liệu...
                                </div>
                            </td></tr>
                        )}
                        {!loading && danhSach.length === 0 && !error && (
                            <tr><td colSpan="5" className="text-center py-12 text-slate-400">
                                <div className="space-y-2">
                                    <p className="text-3xl">📭</p>
                                    <p className="font-medium">Chưa có khiếu nại nào từ sinh viên</p>
                                </div>
                            </td></tr>
                        )}
                        {danhSach.map((item) => (
                            <tr key={item.maKhieuNai} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                    KN-{item.maKhieuNai} <br /> <span className="text-xs font-normal text-slate-400">HS-{item.maHoSo}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{new Date(item.ngayGui).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 text-sm max-w-md">
                                    <p className="truncate text-slate-600" title={item.noiDung}>{item.noiDung}</p>
                                    {item.minhChung && <a href={item.minhChung} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline font-medium">📎 Xem minh chứng</a>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.trangThai === 'ChoXuLy'
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-green-50 text-green-600 border border-green-200'
                                        }`}>
                                        {item.trangThai === 'ChoXuLy' ? '🔴 Chờ xử lý' : '✅ Đã phản hồi'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.trangThai === 'ChoXuLy' && (
                                        <button
                                            onClick={() => handleOpenPhanHoi(item)}
                                            className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-100 text-sm font-semibold transition-colors"
                                        >
                                            Phản hồi
                                        </button>
                                    )}
                                    {item.trangThai === 'DaXuLy' && (
                                        <span className="text-slate-400 text-sm italic">Hoàn tất</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Phản hồi */}
            {showModal && selectedKhieuNai && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-[480px] border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Phản hồi khiếu nại #{selectedKhieuNai.maKhieuNai}</h3>
                        <div className="bg-slate-50 p-4 rounded-2xl mb-5 text-sm text-slate-700 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nội dung SV gửi:</p>
                            <p>{selectedKhieuNai.noiDung}</p>
                            {selectedKhieuNai.minhChung && (
                                <a href={selectedKhieuNai.minhChung} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline mt-2 inline-block">📎 Xem minh chứng</a>
                            )}
                        </div>
                        <form onSubmit={handleGuiPhanHoi}>
                            <div className="mb-5">
                                <label className="block text-slate-600 text-sm font-bold mb-2">Nội dung giải quyết/phản hồi:</label>
                                <textarea
                                    required rows="4"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                    value={phanHoiText}
                                    onChange={(e) => setPhanHoiText(e.target.value)}
                                    placeholder="Nhập nội dung phản hồi cho sinh viên..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-semibold text-sm transition-colors">Đóng</button>
                                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl font-semibold text-sm transition-all">Gửi phản hồi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KhieuNaiQuanLy;