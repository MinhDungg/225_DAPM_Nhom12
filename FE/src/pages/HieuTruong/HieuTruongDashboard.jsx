import React, { useState } from 'react';
import { FileCheck, XCircle, CheckCircle, Eye, FileText, AlertCircle } from 'lucide-react';

const HieuTruongDashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ban Giám hiệu</h2>
                    <p className="text-slate-500 mt-1">Phê duyệt tờ trình và danh sách học bổng chính thức.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Tờ trình số 124/TTr-CTSV</h3>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-0.5">V/v Phê duyệt danh sách HB KKHT Kỳ 1 (2025-2026)</p>
                        </div>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-amber-200">Đang chờ duyệt</span>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-4">Tóm tắt danh sách</p>
                            <div className="space-y-3">
                                <div className="flex justify-between font-bold text-slate-700"><span>Tổng số sinh viên:</span> <span className="text-blue-600">450</span></div>
                                <div className="flex justify-between font-bold text-slate-700"><span>Tổng kinh phí:</span> <span className="text-blue-600">2.450.000.000đ</span></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group">
                            <button className="flex items-center gap-2 font-bold text-slate-500 group-hover:text-blue-600"><Eye size={20} /> Xem danh sách chi tiết</button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                        <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                            <CheckCircle size={22} /> Phê duyệt quyết định
                        </button>
                        <button className="flex-1 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95">
                            <XCircle size={22} /> Từ chối / Yêu cầu chỉnh sửa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HieuTruongDashboard;