import React, { useState } from 'react';
import { Database, Download, Send, Search, CheckCircle, Filter } from 'lucide-react';

const DaoTaoDashboard = () => {
    const [isExtracted, setIsExtracted] = useState(false);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Phòng Đào tạo</h2>
                    <p className="text-gray-500 mt-1">Trích xuất danh sách sinh viên đạt chuẩn học thuật.</p>
                </div>
            </div>

            {/* Bộ lọc trích xuất */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
                    <Filter size={20} /> Thiết lập điều kiện lọc
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Học kỳ / Năm học</label>
                        <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Học kỳ 1 - 2025-2026</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">GPA Tối thiểu</label>
                        <input type="number" defaultValue="2.5" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tín chỉ đăng ký</label>
                        <input type="number" defaultValue="15" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setIsExtracted(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <Database size={20} /> Trích xuất dữ liệu
                        </button>
                    </div>
                </div>
            </div>

            {isExtracted && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
                        <span className="text-blue-800 font-bold flex items-center gap-2">
                            <CheckCircle size={18} /> Đã tìm thấy 1,245 sinh viên đạt chuẩn
                        </span>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                            <Send size={18} /> Chuyển dữ liệu cho Phòng CTSV
                        </button>
                    </div>
                    {/* Table hiển thị ở đây */}
                </div>
            )}
        </div>
    );
};

export default DaoTaoDashboard;