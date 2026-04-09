import React, { useState } from 'react';
import { Users, FileWarning, Send, CheckSquare, BarChart3, ChevronRight } from 'lucide-react';

const CTSVDashboard = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">Phòng CTSV - Quản lý Học bổng</h2>
                    <p className="text-gray-500 mt-1.5">Học kỳ 1 - Năm học 2025-2026 | Theo dõi và điều phối các đợt xét duyệt</p>
                </div>
                <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                    Lập thông báo mới
                </button>
            </div>

            {/* Thẻ thống kê - Bo tròn và hiệu ứng hover */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { icon: Users, label: "Tổng sinh viên đủ ĐK", value: "1,245", color: "blue", change: "Dữ liệu từ P.Đào Tạo" },
                    { icon: CheckSquare, label: "Khoa đã nộp đề xuất", value: "10 / 14", color: "teal", change: "4 khoa đang chậm" },
                    { icon: FileWarning, label: "Khiếu nại chờ xử lý", value: "12", color: "red", change: "Cần xử lý trước 25/03" },
                    { icon: BarChart3, label: "Kinh phí đã phân bổ", value: "2.1 Tỷ", color: "purple", change: "85% tổng ngân sách" }
                ].map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
                            <div className="flex justify-between items-center mb-5">
                                <div className={`bg-${card.color}-50 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className={`text-${card.color}-600 w-7 h-7`} />
                                </div>
                                <span className={`text-xs font-semibold text-${card.color}-600 bg-${card.color}-50 px-3 py-1 rounded-full`}>{card.color === 'red' ? 'Cấp bách' : 'Bình thường'}</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
                            <h3 className={`text-3xl font-extrabold mt-2.5 leading-tight ${card.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>{card.value}</h3>
                            <p className={`text-xs text-gray-500 mt-2 font-medium`}>{card.change}</p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">Các thao tác nghiệp vụ nhanh</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { icon: Send, label: "Phân bổ dữ liệu về Khoa", desc: "Chuyển DS đủ ĐK cho Hội đồng Khoa" },
                        { icon: CheckSquare, label: "Công bố DS Dự kiến", desc: "Công khai DS sinh viên dự kiến nhận học bổng" },
                        { icon: BarChart3, label: "Lập Báo cáo tổng kết", desc: "Xuất dữ liệu cho P.KH-TC" },
                        { icon: Users, label: "Quản lý Hội đồng", desc: "Xem và cập nhật thành viên các Hội đồng" }
                    ].map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button key={index} className="flex flex-col items-center justify-center text-center gap-3 p-6 border border-blue-100 rounded-2xl hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-md transition-all group duration-300">
                                <div className="bg-blue-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                                    <Icon className="text-blue-700 w-8 h-8 mx-auto" />
                                </div>
                                <span className="text-base font-semibold text-gray-800 mt-2 group-hover:text-blue-800">{action.label}</span>
                                <p className="text-xs text-gray-500 mt-1 font-medium">{action.desc}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CTSVDashboard;