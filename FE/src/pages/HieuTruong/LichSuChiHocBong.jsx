import React, { useState, useEffect } from 'react';
import { History, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/api';

const LichSuChiHocBong = () => {
    const [lichSuList, setLichSuList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tongCongDaChi, setTongCongDaChi] = useState(0);

    useEffect(() => {
        fetchLichSuChi();
    }, []);

    const fetchLichSuChi = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/hieutruong/lich-su-chi');
            if (response.data.success) {
                const data = response.data.data;
                setLichSuList(data);
                
                // Tính tổng cộng đã chi (chỉ tính các đợt đã ChinhThuc)
                const tong = data
                    .filter(item => item.trangThai === 'ChinhThuc')
                    .reduce((sum, item) => sum + item.tongChi, 0);
                setTongCongDaChi(tong);
            }
        } catch (error) {
            console.error("Lỗi lấy lịch sử chi:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const getTrangThaiDisplay = (trangThai) => {
        switch (trangThai) {
            case 'ChinhThuc':
                return { text: 'Đã chi', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'ChoPheDuyet':
                return { text: 'Chờ xét duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200' };
            default:
                return { text: 'Đang xử lý', color: 'bg-slate-100 text-slate-600 border-slate-200' };
        }
    };

    const getHocKyDisplay = (hocKy, loaiDot) => {
        // Kiểm tra nếu là học bổng năm học
        if (loaiDot && loaiDot.toLowerCase().includes('năm học')) {
            return 'Năm học';
        }
        return `Kỳ ${hocKy}`;
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
                    <History size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Lịch sử chi học bổng</h2>
                    <p className="text-slate-500 mt-1">Theo dõi toàn bộ các đợt học bổng đã phê duyệt</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">Đang tải lịch sử...</p>
                </div>
            ) : lichSuList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
                    <AlertCircle className="text-slate-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-slate-700">Chưa có lịch sử</h3>
                    <p className="text-slate-500 mt-2">Chưa có đợt học bổng nào được phê duyệt.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-left">
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Kỳ học</th>
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Năm học</th>
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Loại học bổng</th>
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Số SV</th>
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Tổng chi (đ)</th>
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lichSuList.map((item, index) => {
                                    const trangThai = getTrangThaiDisplay(item.trangThai);
                                    return (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6">
                                                <span className="font-bold text-slate-900 text-lg">
                                                    {getHocKyDisplay(item.hocKy, item.loaiDot)}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-bold text-slate-700">{item.namHoc}</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-slate-700 font-medium">{item.loaiDot}</div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-black text-lg">
                                                    {item.soSinhVien}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <span className="font-black text-blue-600 text-lg">
                                                    {formatCurrency(item.tongChi)}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${trangThai.color}`}>
                                                    {item.trangThai === 'ChinhThuc' ? (
                                                        <CheckCircle size={14} />
                                                    ) : (
                                                        <Clock size={14} />
                                                    )}
                                                    {trangThai.text}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer - Tổng cộng */}
                    <div className="bg-slate-50 border-t-2 border-slate-200 p-8">
                        <div className="flex justify-between items-center max-w-4xl ml-auto">
                            <span className="text-slate-600 font-bold text-lg">Tổng cộng đã chi</span>
                            <span className="text-blue-600 font-black text-3xl">
                                {formatCurrency(tongCongDaChi)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LichSuChiHocBong;
