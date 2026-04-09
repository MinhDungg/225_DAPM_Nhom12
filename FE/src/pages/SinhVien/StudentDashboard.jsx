import React, { useState } from 'react';
import { BookOpen, Activity, CheckCircle, Bell, FileWarning, Search, ChevronRight, Send, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('thongbao'); // 'thongbao' hoặc 'khieunai'

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Tiêu đề trang */}
            <div className="flex flex-col">
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">Cổng thông tin Sinh viên</h2>
                <p className="text-gray-500 mt-1.5">Theo dõi thông báo học bổng, danh sách xét duyệt và xử lý khiếu nại.</p>
            </div>

            {/* Thẻ thống kê cá nhân */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 border-l-8 border-l-blue-500 hover:shadow-lg transition-all duration-300">
                    <div className="bg-blue-50 p-4 rounded-2xl"><BookOpen className="text-blue-600 w-8 h-8" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">GPA Tích lũy</p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">3.2 / 4.0</h3>
                        <p className="text-xs text-blue-600 font-medium mt-1">Đạt điều kiện học lực</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 border-l-8 border-l-teal-500 hover:shadow-lg transition-all duration-300">
                    <div className="bg-teal-50 p-4 rounded-2xl"><Activity className="text-teal-600 w-8 h-8" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Điểm rèn luyện</p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">85 / 100</h3>
                        <p className="text-xs text-teal-600 font-medium mt-1">Xếp loại Tốt</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 border-l-8 border-l-amber-500 hover:shadow-lg transition-all duration-300">
                    <div className="bg-amber-50 p-4 rounded-2xl"><CheckCircle className="text-amber-600 w-8 h-8" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Trạng thái Hồ sơ</p>
                        <h3 className="text-xl font-extrabold text-gray-900 mt-1">Dự kiến nhận HB</h3>
                        <p className="text-xs text-amber-600 font-medium mt-1">Chờ công bố chính thức</p>
                    </div>
                </div>
            </div>

            {/* Tabs Menu */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 w-fit">
                <button
                    onClick={() => setActiveTab('thongbao')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'thongbao' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Bell size={18} /> Xem Thông báo & Danh sách
                </button>
                <button
                    onClick={() => setActiveTab('khieunai')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'khieunai' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <FileWarning size={18} /> Gửi Khiếu nại
                </button>
            </div>

            {/* Nội dung Tab: Thông báo & Danh sách */}
            {activeTab === 'thongbao' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Use case: Xem danh sách dự kiến */}
                    <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -z-10 opacity-50"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Mới nhất</span>
                                <h3 className="text-xl font-bold text-gray-900 mt-3">Danh sách Dự kiến nhận HB KKHT Học kỳ 1 (2025-2026)</h3>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                    Phòng CTSV đã tổng hợp và công bố danh sách dự kiến. Sinh viên vui lòng kiểm tra thông tin. Nếu có sai sót về GPA hoặc Điểm rèn luyện, vui lòng gửi khiếu nại trước ngày 10/03/2026.
                                </p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Search size={24} /></div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
                                Tra cứu tên của bạn <ChevronRight size={16} />
                            </button>
                            <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                                Tải file Excel toàn trường
                            </button>
                        </div>
                    </div>

                    {/* Use case: Xem danh sách chính thức */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Đã đóng</span>
                                <h3 className="text-xl font-bold text-gray-900 mt-3">Quyết định & Danh sách Chính thức HB KKHT Học kỳ 2 (2024-2025)</h3>
                                <p className="text-sm text-gray-500 mt-2">Hiệu trưởng đã phê duyệt danh sách chính thức. Phòng KH-TC đang tiến hành giải ngân qua tài khoản ngân hàng của sinh viên.</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-2xl text-green-600"><CheckCircle size={24} /></div>
                        </div>
                        <button className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                            Xem chi tiết Quyết định <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Nội dung Tab: Gửi khiếu nại */}
            {activeTab === 'khieunai' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-fade-in flex flex-col md:flex-row gap-10">
                    <div className="flex-1 space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Biểu mẫu Khiếu nại</h3>
                            <p className="text-gray-500 text-sm mt-1">Dành cho sinh viên phát hiện sai sót trong Danh sách Dự kiến.</p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                            <AlertCircle className="shrink-0 w-5 h-5" />
                            <p>Lưu ý: Hệ thống chỉ tiếp nhận khiếu nại trong vòng <strong>10 ngày</strong> kể từ khi công bố Danh sách Dự kiến. Vui lòng đính kèm minh chứng rõ ràng.</p>
                        </div>

                        <form className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chương trình học bổng khiếu nại *</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option>HB KKHT Học kỳ 1 (Năm 2025-2026)</option>
                                    <option>HB Doanh nghiệp VNPT</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Loại sai sót *</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option>Sai sót Điểm trung bình (GPA)</option>
                                    <option>Sai sót Điểm rèn luyện</option>
                                    <option>Thiếu tên trong danh sách</option>
                                    <option>Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trình bày chi tiết *</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Mô tả cụ thể vấn đề của bạn..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đính kèm minh chứng (Hình ảnh/PDF)</label>
                                <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                            </div>

                            <button type="button" className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                <Send size={18} /> Gửi khiếu nại tới Phòng CTSV
                            </button>
                        </form>
                    </div>

                    {/* Cột hiển thị lịch sử khiếu nại */}
                    <div className="w-full md:w-1/3 bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
                        <h4 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">Lịch sử khiếu nại của bạn</h4>
                        <div className="text-center py-8">
                            <CheckCircle className="text-gray-300 w-12 h-12 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Bạn chưa gửi khiếu nại nào trong học kỳ này.</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentDashboard;