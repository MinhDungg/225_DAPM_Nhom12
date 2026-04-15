import React, { useState, useEffect } from 'react';
import { BookOpen, Activity, CheckCircle, Bell, FileWarning, Search, ChevronRight, Send, AlertCircle, Clock, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('thongbao'); // 'thongbao' hoặc 'khieunai'

    // State quản lý dữ liệu API
    const [hoSos, setHoSos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Gọi API khi component vừa load
    useEffect(() => {
        fetchMyProfiles();
    }, []);

    const fetchMyProfiles = async () => {
        try {
            const response = await api.get('/api/sinhvien/tracuu');
            if (response.data.success) {
                setHoSos(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Lấy hồ sơ mới nhất để hiển thị lên thẻ Thống kê (nếu có)
    const latestProfile = hoSos.length > 0 ? hoSos[0] : null;

    // Helper: Định dạng hiển thị trạng thái cực xịn xò
    const renderStatusUI = (status) => {
        switch (status) {
            case 'ChoXet':
                return { text: 'Đang chờ xét', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', icon: <Clock size={16} /> };
            case 'KhoaDeXuat':
                return { text: 'Khoa đã đề xuất', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', icon: <Search size={16} /> };
            case 'DanhSachDuKien':
                return { text: 'Dự kiến nhận HB', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', icon: <AlertCircle size={16} /> };
            case 'ChinhThuc':
                return { text: 'Chính thức đạt HB', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: <CheckCircle size={16} /> };
            default:
                return { text: status || 'Chưa có', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', icon: <Clock size={16} /> };
        }
    };

    const latestStatusUI = renderStatusUI(latestProfile?.trangThai);

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
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">GPA Hiện tại</p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{latestProfile ? latestProfile.gpa : '---'}</h3>
                        <p className="text-xs text-blue-600 font-medium mt-1">Dữ liệu từ hệ thống</p>
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

                <div className={`bg-white rounded-3xl shadow-sm border p-6 flex items-center gap-5 border-l-8 hover:shadow-lg transition-all duration-300 ${latestStatusUI.border}`}>
                    <div className={`${latestStatusUI.bg} p-4 rounded-2xl`}>
                        {latestProfile?.trangThai === 'ChinhThuc' ? <CheckCircle className={`${latestStatusUI.color} w-8 h-8`} /> : <Clock className={`${latestStatusUI.color} w-8 h-8`} />}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Trạng thái Hồ sơ</p>
                        <h3 className="text-xl font-extrabold text-gray-900 mt-1">{latestStatusUI.text}</h3>
                        <p className={`text-xs font-medium mt-1 ${latestStatusUI.color}`}>
                            {latestProfile ? 'Hồ sơ mới nhất' : 'Chưa có hồ sơ'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs Menu */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 w-fit">
                <button
                    onClick={() => setActiveTab('thongbao')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'thongbao' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Bell size={18} /> Tiến trình & Danh sách
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

                    {/* Bảng tiến trình cá nhân (Tích hợp API) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Tiến trình hồ sơ của bạn</h3>
                            <p className="text-sm text-gray-500 mt-1">Theo dõi kết quả xét duyệt qua các vòng trực tiếp từ dữ liệu Nhà trường.</p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-blue-600">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-sm font-medium">Đang tải dữ liệu hồ sơ...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                                <AlertCircle size={18} /> {error}
                            </div>
                        ) : hoSos.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Bạn chưa có hồ sơ xét học bổng nào trong hệ thống.</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider font-bold">
                                            <th className="py-4 px-6 border-b border-gray-100">Mã Hồ Sơ</th>
                                            <th className="py-4 px-6 border-b border-gray-100 text-center">GPA</th>
                                            <th className="py-4 px-6 border-b border-gray-100">Xếp loại</th>
                                            <th className="py-4 px-6 border-b border-gray-100">Tiến trình hiện tại</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-medium text-gray-700">
                                        {hoSos.map((hoso) => {
                                            const statusUI = renderStatusUI(hoso.trangThai);
                                            return (
                                                <tr key={hoso.maHoSo} className="hover:bg-blue-50/50 transition-colors group border-b border-gray-50 last:border-0">
                                                    <td className="py-4 px-6 text-blue-600 font-bold">HS-{hoso.maHoSo}</td>
                                                    <td className="py-4 px-6 text-center">{hoso.gpa.toFixed(2)}</td>
                                                    <td className="py-4 px-6">
                                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold">
                                                            {hoso.xepLoaiHB || 'Đang xét'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusUI.bg} ${statusUI.color}`}>
                                                            {statusUI.icon} {statusUI.text}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Nội dung Tab: Gửi khiếu nại (Giữ nguyên giao diện Form tĩnh của bạn) */}
            {activeTab === 'khieunai' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-fade-in flex flex-col md:flex-row gap-10">
                    {/* ... (Đoạn code Form khiếu nại của bạn giữ nguyên, mình rút gọn để đỡ dài) ... */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Biểu mẫu Khiếu nại</h3>
                            <p className="text-gray-500 text-sm mt-1">Dành cho sinh viên phát hiện sai sót trong Danh sách Dự kiến.</p>
                        </div>
                        {/* Các input form của bạn */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                            <AlertCircle className="shrink-0 w-5 h-5" />
                            <p>Lưu ý: Hệ thống chỉ tiếp nhận khiếu nại trong vòng <strong>10 ngày</strong> kể từ khi công bố Danh sách Dự kiến. Vui lòng đính kèm minh chứng rõ ràng.</p>
                        </div>
                        <button type="button" className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <Send size={18} /> Gửi khiếu nại tới Phòng CTSV
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;