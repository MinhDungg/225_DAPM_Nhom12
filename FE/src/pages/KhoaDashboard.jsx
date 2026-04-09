import React from 'react';
import { ClipboardList, PieChart, Users, ArrowUpRight } from 'lucide-react';

const KhoaDashboard = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Ban Chủ nhiệm Khoa</h2>
                    <p className="text-gray-500 mt-1">Lập danh sách đề xuất học bổng theo chỉ tiêu của Khoa.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card Chỉ tiêu */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                    <PieChart className="absolute right-[-10px] bottom-[-10px] w-40 h-40 opacity-10" />
                    <h3 className="text-lg font-medium opacity-80">Kinh phí được phân bổ</h3>
                    <h4 className="text-4xl font-black mt-2">450.000.000 VNĐ</h4>
                    <div className="mt-8 flex gap-4">
                        <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                            <p className="text-xs opacity-80 uppercase">Chỉ tiêu SV</p>
                            <p className="font-bold text-xl">120 Suất</p>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                            <p className="text-xs opacity-80 uppercase">Đã chọn</p>
                            <p className="font-bold text-xl">85 Suất</p>
                        </div>
                    </div>
                </div>

                {/* Card Hành động */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Tiến trình lập danh sách</h3>
                        <p className="text-sm text-gray-500 mt-2">Dữ liệu sinh viên đủ điều kiện đã được Phòng CTSV phân bổ.</p>
                    </div>
                    <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group">
                        <ClipboardList size={20} /> Lập danh sách đề xuất <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KhoaDashboard;