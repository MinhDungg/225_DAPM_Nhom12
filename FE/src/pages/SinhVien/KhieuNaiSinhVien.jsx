import React, { useState, useEffect } from 'react';
import KhieuNaiService from '../../services/khieuNaiService';

const KhieuNaiSinhVien = () => {
    const [danhSach, setDanhSach] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ maHoSo: '', noiDung: '', minhChung: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await KhieuNaiService.layKhieuNaiSinhVien();
            if (res.success) {
                setDanhSach(res.data || []);
            } else {
                setError(res.message || 'Không thể tải dữ liệu.');
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách khiếu nại', err);
            setError('Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại Backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuiKhieuNai = async (e) => {
        e.preventDefault();
        try {
            const res = await KhieuNaiService.guiKhieuNai({
                maHoSo: parseInt(formData.maHoSo),
                noiDung: formData.noiDung,
                minhChung: formData.minhChung || null
            });
            if (res.success) {
                alert('Gửi khiếu nại thành công!');
                setShowModal(false);
                setFormData({ maHoSo: '', noiDung: '', minhChung: '' });
                fetchData();
            } else {
                alert(res.message || 'Gửi khiếu nại thất bại.');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi gửi khiếu nại. Vui lòng thử lại.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Khiếu nại Học bổng</h2>
                    <p className="text-sm text-slate-500 mt-1">Gửi và theo dõi tình trạng khiếu nại của bạn</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 font-semibold text-sm flex items-center gap-2"
                >
                    <span className="text-lg leading-none">+</span> Gửi Khiếu Nại Mới
                </button>
            </div>

            {/* Thông báo lỗi */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Bảng danh sách khiếu nại */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm rounded-3xl overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-slate-50/80 text-left text-slate-500 uppercase text-xs font-bold tracking-wider">
                            <th className="px-6 py-4 border-b border-slate-100">Mã HS</th>
                            <th className="px-6 py-4 border-b border-slate-100">Nội dung</th>
                            <th className="px-6 py-4 border-b border-slate-100">Trạng thái</th>
                            <th className="px-6 py-4 border-b border-slate-100">Phản hồi từ Khoa/Trường</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan="4" className="text-center py-8 text-slate-400">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    Đang tải dữ liệu...
                                </div>
                            </td></tr>
                        )}
                        {!loading && danhSach.length === 0 && !error && (
                            <tr><td colSpan="4" className="text-center py-12 text-slate-400">
                                <div className="space-y-2">
                                    <p className="text-3xl">📋</p>
                                    <p className="font-medium">Chưa có khiếu nại nào</p>
                                    <p className="text-xs">Nhấn "Gửi Khiếu Nại Mới" để tạo khiếu nại đầu tiên</p>
                                </div>
                            </td></tr>
                        )}
                        {danhSach.map((item) => (
                            <tr key={item.maKhieuNai} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-semibold text-slate-700">HS-{item.maHoSo}</td>
                                <td className="px-6 py-4 text-sm max-w-xs truncate text-slate-600" title={item.noiDung}>{item.noiDung}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.trangThai === 'ChoXuLy'
                                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                        : 'bg-green-50 text-green-600 border border-green-200'
                                        }`}>
                                        {item.trangThai === 'ChoXuLy' ? '⏳ Chờ xử lý' : '✅ Đã xử lý'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {item.noiDungPhanHoi ? (
                                        <div className="space-y-1">
                                            <p className="text-slate-700"><strong className="text-blue-600">{item.nguoiPhanHoi || 'Cán bộ'}:</strong> {item.noiDungPhanHoi}</p>
                                            <p className="text-xs text-slate-400">{item.ngayPhanHoi ? new Date(item.ngayPhanHoi).toLocaleDateString('vi-VN') : ''}</p>
                                        </div>
                                    ) : <span className="text-slate-400 italic">Chưa có phản hồi</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Thêm Khiếu Nại */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-[440px] border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Gửi Khiếu Nại Mới</h3>
                        <form onSubmit={handleGuiKhieuNai}>
                            <div className="mb-5">
                                <label className="block text-slate-600 text-sm font-bold mb-2">Mã Hồ Sơ của bạn</label>
                                <input
                                    type="number" required
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Nhập mã hồ sơ..."
                                    value={formData.maHoSo}
                                    onChange={(e) => setFormData({ ...formData, maHoSo: e.target.value })}
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-slate-600 text-sm font-bold mb-2">Nội dung khiếu nại</label>
                                <textarea
                                    required rows="4"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                    placeholder="Mô tả chi tiết nội dung khiếu nại..."
                                    value={formData.noiDung}
                                    onChange={(e) => setFormData({ ...formData, noiDung: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="mb-6">
                                <label className="block text-slate-600 text-sm font-bold mb-2">Link minh chứng (Drive, Ảnh...)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.minhChung}
                                    onChange={(e) => setFormData({ ...formData, minhChung: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-semibold text-sm transition-colors">Hủy</button>
                                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl font-semibold text-sm transition-all">Gửi đi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KhieuNaiSinhVien;