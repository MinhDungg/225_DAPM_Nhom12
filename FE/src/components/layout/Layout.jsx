import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home, FileText, Bell, User, LogOut, Award, ChevronDown,
    Database, Users, ShieldCheck, Landmark, FileCheck,
    ClipboardList, CheckSquare, MessageSquareWarning
} from 'lucide-react';

const Layout = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // TỰ ĐỘNG DÒ TÌM VAI TRÒ DỰA VÀO URL TRÌNH DUYỆT
    let activeRole = role;
    if (location.pathname.includes('/sinh-vien')) activeRole = 'SinhVien';
    else if (location.pathname.includes('/ctsv')) activeRole = 'CTSV';
    else if (location.pathname.includes('/dao-tao')) activeRole = 'DaoTao';
    else if (location.pathname.includes('/khoa')) activeRole = 'Khoa';
    else if (location.pathname.includes('/hdxd')) activeRole = 'HDXD';
    else if (location.pathname.includes('/tai-chinh')) activeRole = 'KHTC';
    else if (location.pathname.includes('/hieu-truong')) activeRole = 'HieuTruong';

    // 1. TỪ ĐIỂN ĐỔI TÊN VAI TRÒ
    const roleDisplayNames = {
        'SinhVien': 'Sinh Viên',
        'CTSV': 'Phòng CTSV',
        'DaoTao': 'Phòng Đào Tạo',
        'Khoa': 'Ban Chủ nhiệm Khoa',
        'HDXD': 'Hội Đồng Xét Duyệt',
        'KHTC': 'Phòng KH - Tài Chính',
        'HieuTruong': 'Ban Giám Hiệu'
    };

    // 2. CẤU HÌNH MENU RIÊNG CHO TỪNG TÁC NHÂN
    const menuConfig = {
        'SinhVien': [
            { path: '/sinh-vien', icon: Home, label: 'Trang chủ Dashboard' },
            { path: '/sinh-vien', icon: Bell, label: 'Thông báo & Danh sách' },
            { path: '/sinh-vien', icon: MessageSquareWarning, label: 'Gửi khiếu nại' },
            { path: '/sinh-vien', icon: User, label: 'Hồ sơ cá nhân' }
        ],
        'CTSV': [
            { path: '/ctsv', icon: Home, label: 'Tổng quan học bổng' },
            { path: '/ctsv', icon: Users, label: 'Phân bổ dữ liệu Khoa' },
            { path: '/ctsv', icon: Bell, label: 'Công bố danh sách' },
            { path: '/ctsv', icon: FileCheck, label: 'Trình duyệt danh sách' },
            { path: '/ctsv', icon: MessageSquareWarning, label: 'Xử lý khiếu nại' }
        ],
        'DaoTao': [
            { path: '/dao-tao', icon: Home, label: 'Trang chủ Đào tạo' },
            { path: '/dao-tao', icon: Database, label: 'Cung cấp DS đủ điều kiện' }
        ],
        'Khoa': [
            { path: '/khoa', icon: Home, label: 'Trang chủ Khoa' },
            { path: '/khoa', icon: ClipboardList, label: 'Lập danh sách đề xuất' }
        ],
        'HDXD': [
            { path: '/hdxd', icon: Home, label: 'Trang chủ Hội đồng' },
            { path: '/hdxd', icon: ShieldCheck, label: 'Xét chọn sinh viên' },
            { path: '/hdxd', icon: FileText, label: 'Xem hồ sơ minh chứng' }
        ],
        'KHTC': [
            { path: '/tai-chinh', icon: Home, label: 'Trang chủ Tài chính' },
            { path: '/tai-chinh', icon: Landmark, label: 'Kinh phí học bổng' }
        ],
        'HieuTruong': [
            { path: '/hieu-truong', icon: Home, label: 'Trang chủ BGH' },
            { path: '/hieu-truong', icon: CheckSquare, label: 'Phê duyệt danh sách' }
        ]
    };

    // ĐÃ SỬA: Lấy danh sách menu theo activeRole
    const currentMenus = menuConfig[activeRole] || [];

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl z-20">
                <div className="p-5 border-b border-blue-700/50 flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                        <Award className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-xl tracking-tight">UTE SCHOLAR</h1>
                        {/* ĐÃ SỬA: Hiển thị tên Role cực xịn theo activeRole */}
                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
                            {roleDisplayNames[activeRole] || activeRole}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
                    <ul className="space-y-1.5 px-3">
                        {currentMenus.map((menu, index) => {
                            const Icon = menu.icon;
                            // ĐÃ SỬA: Thêm logic kiểm tra xem Menu nào đang được chọn để làm sáng lên
                            const isActive = location.pathname.includes(menu.path);

                            return (
                                <li key={index}>
                                    <Link
                                        to={menu.path}
                                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-white/15 text-white shadow-inner font-bold' : 'text-blue-100 hover:bg-white/10 hover:text-white font-medium'}`}
                                    >
                                        <Icon size={20} className={`transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                                        <span className="text-sm">{menu.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-blue-700/50 bg-blue-950/30">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3.5 px-4 py-2.5 w-full rounded-lg text-blue-100 hover:bg-red-500 hover:text-white transition-all duration-300 group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm relative z-10">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-900">Cổng thông tin Học bổng</h2>
                        <p className="text-xs text-gray-400 mt-1">Hệ thống quản lý và xét duyệt trực tuyến</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Bell className="text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" size={24} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
                        </div>

                        <div className="flex items-center gap-3 border-l pl-6 border-gray-100 cursor-pointer group">
                            {/* ĐÃ SỬA: Icon Avatar cập nhật theo activeRole */}
                            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 font-extrabold shadow-inner">
                                {activeRole === 'SinhVien' ? 'SV' : 'CB'}
                            </div>
                            <div className="flex flex-col">
                                {/* ĐÃ SỬA: Tên người dùng góc phải cập nhật theo activeRole */}
                                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                                    {activeRole === 'SinhVien' ? 'Huỳnh Minh Dũng' : 'Cán bộ Hệ thống'}
                                </span>
                                {/* ĐÃ SỬA: Chức vụ góc phải cập nhật theo activeRole */}
                                <span className="text-xs text-gray-500">{roleDisplayNames[activeRole]}</span>
                            </div>
                            <ChevronDown className="text-gray-400 w-5 h-5 group-hover:text-blue-600 transition-colors" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;