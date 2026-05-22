import React, { useState } from 'react';
import {
    Wallet, Landmark, TrendingUp, Save, Calculator,
    Building2, PieChart, CheckCircle, ArrowRight, Activity
} from 'lucide-react';

const TaiChinhDashboard = () => {
    // State quản lý số tiền để tự động tính toán
    const [baseAmount, setBaseAmount] = useState(5500000); // 5.5 triệu
    const [totalBudget, setTotalBudget] = useState(2500000000); // 2.5 tỷ
    const [isSaved, setIsSaved] = useState(false);

    // Tự động tính toán mức Giỏi (x1.2) và Xuất sắc (x1.5)
    const gioiAmount = baseAmount * 1.2;
    const xuatSacAmount = baseAmount * 1.5;

    // Mock data: Danh sách phân bổ ngân sách dự kiến cho các Khoa
    const khoaAllocations = [
        { id: 'K01', name: 'Khoa Công nghệ Thông tin', students: 4500, ratio: 20, budget: 500000000 },
        { id: 'K02', name: 'Khoa Điện - Điện tử', students: 3800, ratio: 16, budget: 400000000 },
        { id: 'K03', name: 'Khoa Cơ khí', students: 3200, ratio: 14, budget: 350000000 },
        { id: 'K04', name: 'Khoa Kinh tế', students: 4000, ratio: 18, budget: 450000000 },
        { id: 'K05', name: 'Khoa Ngoại ngữ', students: 2000, ratio: 10, budget: 250000000 },
    ];

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000); // Tắt thông báo sau 3s
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-slate-200 pb-5">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Phòng Kế hoạch - Tài chính</h2>
                    <p className="text-slate-500 mt-1.5">Thiết lập định mức chi trả và quản lý nguồn quỹ học bổng toàn trường.</p>
                </div>
                {isSaved && (
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-200 animate-in slide-in-from-top-4">
                        <CheckCircle size={18} /> Đã cập nhật định mức lên Hệ thống
                    </span>
                )}
            </div>

            {/* Thẻ thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 rounded-[2rem] shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                    <PieChart className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10" />
                    <div className="flex items-center gap-3 mb-2 opacity-80">
                        <Landmark size={20} /> <p className="text-xs font-bold uppercase tracking-widest">Ngân sách HK1 (2025-2026)</p>
                    </div>
                    <h4 className="text-3xl font-black mt-1">2.500.000.000 đ</h4>
                    <p className="text-sm mt-4 text-blue-100 flex items-center gap-2">
                        <CheckCircle size={14} /> Sẵn sàng phân bổ
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2 text-emerald-600">
                        <TrendingUp size={20} /> <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Đã giải ngân</p>
                    </div>
                    <h4 className="text-3xl font-black text-slate-800 mt-1">0 đ</h4>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-2">Tiến độ: 0% (Chờ BGH phê duyệt)</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2 text-amber-500">
                        <Activity size={20} /> <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Dự kiến số suất</p>
                    </div>
                    <h4 className="text-3xl font-black text-slate-800 mt-1">~ 380 <span className="text-lg font-medium text-slate-500">Sinh viên</span></h4>
                    <p className="text-xs font-medium text-slate-500 mt-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        Dựa trên định mức Khá, Giỏi, Xuất sắc hiện tại.
                    </p>
                </div>
            </div>

            {/* Form thiết lập định mức */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calculator className="text-blue-600" size={24} /> Bảng định mức chi trả Học bổng
                    </h3>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Save size={18} /> Lưu & Công bố hệ thống
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột nhập liệu */}
                    <div className="lg:col-span-1 space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tổng quỹ học bổng (VNĐ)</label>
                            <input
                                type="number"
                                value={totalBudget}
                                onChange={(e) => setTotalBudget(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Định mức chuẩn (Loại Khá)</label>
                            <input
                                type="number"
                                value={baseAmount}
                                onChange={(e) => setBaseAmount(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                            />
                            <p className="text-xs text-slate-500 ml-1 italic">* Hệ thống tự động tính hệ số các loại khác.</p>
                        </div>
                    </div>

                    {/* Cột hiển thị kết quả tính toán */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border border-slate-100 bg-white rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-3">Hệ số 1.0</span>
                            <p className="text-sm font-bold text-slate-500 uppercase">Loại Khá</p>
                            <p className="text-2xl font-black text-slate-800 mt-2">{baseAmount.toLocaleString('vi-VN')} đ</p>
                        </div>
                        <div className="border border-blue-100 bg-blue-50/30 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm relative">
                            <ArrowRight className="absolute -left-6 top-1/2 -translate-y-1/2 text-slate-300 hidden sm:block" size={24} />
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-3">Hệ số 1.2</span>
                            <p className="text-sm font-bold text-slate-500 uppercase">Loại Giỏi</p>
                            <p className="text-2xl font-black text-blue-800 mt-2">{gioiAmount.toLocaleString('vi-VN')} đ</p>
                        </div>
                        <div className="border border-purple-100 bg-purple-50/30 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm relative">
                            <ArrowRight className="absolute -left-6 top-1/2 -translate-y-1/2 text-slate-300 hidden sm:block" size={24} />
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-3">Hệ số 1.5</span>
                            <p className="text-sm font-bold text-slate-500 uppercase">Loại Xuất Sắc</p>
                            <p className="text-2xl font-black text-purple-800 mt-2">{xuatSacAmount.toLocaleString('vi-VN')} đ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bảng Phân bổ ngân sách cho các Khoa */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="text-blue-600" size={24} /> Dự kiến Phân bổ Ngân sách theo Khoa
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                            <tr>
                                <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Mã Khoa</th>
                                <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Tên Đơn vị</th>
                                <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-center">Tổng SV</th>
                                <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-center">Tỷ lệ (%)</th>
                                <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-right">Kinh phí cấp (VNĐ)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {khoaAllocations.map((khoa) => (
                                <tr key={khoa.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-5 font-bold text-slate-500">{khoa.id}</td>
                                    <td className="p-5 font-bold text-slate-800">{khoa.name}</td>
                                    <td className="p-5 text-center font-medium">{khoa.students.toLocaleString('vi-VN')}</td>
                                    <td className="p-5 text-center">
                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold">
                                            {khoa.ratio}%
                                        </span>
                                    </td>
                                    <td className="p-5 text-right font-black text-emerald-700">
                                        {khoa.budget.toLocaleString('vi-VN')} đ
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50">
                                <td colSpan="3" className="p-5 text-right font-bold text-slate-700 uppercase">Tổng cộng:</td>
                                <td className="p-5 text-center font-bold text-slate-700">~ 100%</td>
                                <td className="p-5 text-right font-black text-blue-700 text-lg">2.500.000.000 đ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TaiChinhDashboard;