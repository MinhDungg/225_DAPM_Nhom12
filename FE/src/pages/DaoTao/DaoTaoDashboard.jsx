import React, { useState } from 'react';
import { Database, Send, CheckCircle, Search, Filter, FileSpreadsheet } from 'lucide-react';

const DaoTaoDashboard = () => {
    const [status, setStatus] = useState('idle'); // idle, loading, done

    const handleExtract = () => {
        setStatus('loading');
        setTimeout(() => setStatus('done'), 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Phòng Đào tạo</h2>
                    <p className="text-slate-500 mt-1">Khởi tạo dữ liệu học thuật cho quy trình xét học bổng.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Filter size={20} /></div>
                    <h3 className="text-xl font-bold text-slate-800">Cấu hình trích xuất dữ liệu</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Học kỳ xét duyệt</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium">
                            <option>Học kỳ 1 - 2025-2026</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">GPA tối thiểu (&gt;=)</label>
                        <input type="number" defaultValue="2.5" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleExtract}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Database size={20} /> {status === 'loading' ? 'Đang trích xuất...' : 'Bắt đầu trích xuất'}
                        </button>
                    </div>
                </div>
            </div>

            {status === 'done' && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200">
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <h4 className="font-bold text-emerald-900 text-lg">Trích xuất hoàn tất!</h4>
                            <p className="text-emerald-700 text-sm">Tìm thấy 1.245 sinh viên đạt chuẩn học thuật (GPA &gt;= 2.5).</p>
                        </div>
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all">
                        <Send size={18} /> Chuyển dữ liệu cho Phòng CTSV
                    </button>
                </div>
            )}
        </div>
    );
};

export default DaoTaoDashboard;