import React from 'react';
import { Wallet, Landmark, TrendingUp, Save, Calculator } from 'lucide-react';

const TaiChinhDashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Phòng Kế hoạch - Tài chính</h2>
                    <p className="text-slate-500 mt-1">Quản lý ngân sách và định mức chi trả học bổng.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Landmark size={32} /></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ngân sách HK1</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">2.500.000.000đ</h4>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><TrendingUp size={32} /></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đã giải ngân</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">0đ (0%)</h4>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                    <Calculator className="text-blue-600" size={24} /> Thiết lập mức chi trả học bổng
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Tổng mức kinh phí học bổng (VNĐ) </label>
                        <input type="text" defaultValue="2.500.000.000" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-lg font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Mức học bổng loại Khá (VNĐ/SV) </label>
                        <input type="text" defaultValue="5.500.000" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-lg font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95">
                        <Save size={20} /> Lưu và Cập nhật hệ thống
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaiChinhDashboard;