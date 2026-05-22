import React, { useState, useEffect } from 'react';
import { BookOpen, Activity, CheckCircle, Bell, FileWarning, Search, Send, AlertCircle, Clock, Loader2, LogOut } from 'lucide-react';
import api from '../../utils/api';
import KhieuNaiSinhVien from './KhieuNaiSinhVien';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('thongbao'); // 'thongbao' hoặc 'khieunai'

    const [hoSos, setHoSos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const latestProfile = hoSos.length > 0 ? hoSos[0] : null;

    // Helper UI Badge gọn gàng hơn
    const renderStatusUI = (status) => {
        switch (status) {
            case 'ChoXet':
                return { text: 'Đang chờ xét', color: 'text-gray-700', bg: 'bg-gray-100', icon: <Clock size={14} /> };
            case 'KhoaDeXuat':
                return { text: 'Khoa đề xuất', color: 'text-blue-700', bg: 'bg-blue-50', icon: <Search size={14} /> };
            case 'DanhSachDuKien':
                return { text: 'Dự kiến', color: 'text-amber-700', bg: 'bg-amber-50', icon: <AlertCircle size={14} /> };
            case 'ChinhThuc':
                return { text: 'Chính thức', color: 'text-green-700', bg: 'bg-green-50', icon: <CheckCircle size={14} /> };
            default:
                return { text: status || 'Chưa có', color: 'text-gray-700', bg: 'bg-gray-100', icon: <Clock size={14} /> };
        }
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const latestStatusUI = renderStatusUI(latestProfile?.trangThai);

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Cổng thông tin Sinh viên</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Xin chào, <span className="font-medium text-gray-900">{userInfo.name || 'Sinh viên'}</span>. Chào mừng bạn quay trở lại.
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <LogOut size={16} />
                    Đăng xuất
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Thẻ 1 */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center text-gray-500">
                        <span className="text-sm font-medium">GPA Hiện tại</span>
                        <BookOpen size={16} className="text-gray-400" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                        {latestProfile && latestProfile.gpa != null ? Number(latestProfile.gpa).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                    </span>
                </div>

                {/* Thẻ 2 */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center text-gray-500">
                        <span className="text-sm font-medium">Điểm học tập</span>
                        <Activity size={16} className="text-gray-400" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                        {latestProfile && latestProfile.diemHocTap != null ? Number(latestProfile.diemHocTap).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                    </span>
                </div>

                {/* Thẻ 3 */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center text-gray-500">
                        <span className="text-sm font-medium">Điểm rèn luyện</span>
                        <Activity size={16} className="text-gray-400" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                        {latestProfile ? latestProfile.diemRenLuyen : '--'}
                    </span>
                </div>

                {/* Thẻ 4 */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center text-gray-500">
                        <span className="text-sm font-medium">Trạng thái hồ sơ</span>
                        <div className={`p-1.5 rounded-md ${latestStatusUI.bg} ${latestStatusUI.color}`}>
                            {latestStatusUI.icon}
                        </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 truncate" title={latestStatusUI.text}>
                        {latestStatusUI.text}
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                {/* Modern Tabs */}
                <div className="flex gap-6 border-b border-gray-200 px-6 pt-2">
                    <button
                        onClick={() => setActiveTab('thongbao')}
                        className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'thongbao'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Bell size={16} /> Hồ sơ & Tiến trình
                    </button>
                    <button
                        onClick={() => setActiveTab('khieunai')}
                        className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'khieunai'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FileWarning size={16} /> Gửi Khiếu nại
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'thongbao' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Tiến trình hồ sơ</h3>
                                <p className="text-sm text-gray-500">Danh sách các hồ sơ xét học bổng đã được ghi nhận trên hệ thống.</p>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mb-3 text-gray-400" />
                                    <p className="text-sm">Đang tải dữ liệu...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            ) : hoSos.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Bạn chưa có hồ sơ xét học bổng nào.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                                                <th className="py-3 px-4 border-b border-gray-200">Mã Hồ Sơ</th>
                                                <th className="py-3 px-4 border-b border-gray-200 text-right">GPA</th>
                                                <th className="py-3 px-4 border-b border-gray-200 text-right">Học Tập</th>
                                                <th className="py-3 px-4 border-b border-gray-200 text-right">Rèn Luyện</th>
                                                <th className="py-3 px-4 border-b border-gray-200">Xếp loại</th>
                                                <th className="py-3 px-4 border-b border-gray-200">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                            {hoSos.map((hoso) => {
                                                const statusUI = renderStatusUI(hoso.trangThai);
                                                return (
                                                    <tr key={hoso.maHoSo} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-4 font-medium text-gray-900">HS-{hoso.maHoSo}</td>
                                                        <td className="py-3 px-4 text-right">{hoso.gpa != null ? Number(hoso.gpa).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-3 px-4 text-right">{hoso.diemHocTap != null ? Number(hoso.diemHocTap).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="py-3 px-4 text-right">{hoso.diemRenLuyen !== undefined ? hoso.diemRenLuyen : '-'}</td>
                                                        <td className="py-3 px-4">
                                                            {hoso.xepLoaiHB ? (
                                                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                                    {hoso.xepLoaiHB}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statusUI.bg} ${statusUI.color}`}>
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
                    )}

                    {activeTab === 'khieunai' && (
                        <KhieuNaiSinhVien />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;