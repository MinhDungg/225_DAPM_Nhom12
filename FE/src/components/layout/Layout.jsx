import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home, FileText, Bell, User, LogOut, ChevronDown,
    Database, Users, ShieldCheck, Landmark, FileCheck,
    ClipboardList, CheckSquare, MessageSquareWarning,
    GraduationCap, LifeBuoy, Sparkles, PlusCircle, FileSpreadsheet, History
} from 'lucide-react';

const Layout = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Dò tìm role từ URL
    let activeRole = role;
    if (location.pathname.includes('/sinh-vien')) activeRole = 'SinhVien';
    else if (location.pathname.includes('/ctsv')) activeRole = 'CTSV';
    else if (location.pathname.includes('/dao-tao')) activeRole = 'DaoTao';
    else if (location.pathname.includes('/khoa')) activeRole = 'Khoa';
    else if (location.pathname.includes('/hdxd')) activeRole = 'HDXD';
    else if (location.pathname.includes('/tai-chinh')) activeRole = 'KHTC';
    else if (location.pathname.includes('/hieu-truong')) activeRole = 'HieuTruong';

    const roleDisplayNames = {
        'SinhVien': 'Sinh Viên',
        'CTSV': 'Phòng CTSV',
        'DaoTao': 'Phòng Đào Tạo',
        'Khoa': 'Ban Chủ nhiệm Khoa',
        'HDXD': 'Hội Đồng Xét Duyệt',
        'KHTC': 'Phòng KH - Tài Chính',
        'HieuTruong': 'Ban Giám Hiệu'
    };

    const menuConfig = {
        'SinhVien': [
            { path: '/sinh-vien', icon: Home, label: 'Trang chủ Dashboard' },
            { path: '/sinh-vien/thong-bao', icon: Bell, label: 'Thông báo & Danh sách' },
            { path: '/sinh-vien/khieu-nai', icon: MessageSquareWarning, label: 'Gửi khiếu nại' },
            { path: '/sinh-vien/ho-so', icon: User, label: 'Hồ sơ cá nhân' }
        ],
        'CTSV': [
            { path: '/ctsv', icon: Home, label: 'Tổng quan học bổng' },
            { path: '/ctsv/tao-dot-hoc-bong', icon: PlusCircle, label: 'Tạo đợt học bổng' },
            { path: '/ctsv/phan-bo', icon: Users, label: 'Phân bổ dữ liệu Khoa' },
            { path: '/ctsv/cong-bo', icon: Bell, label: 'Công bố danh sách' },
            { path: '/ctsv/trinh-duyet', icon: FileCheck, label: 'Trình duyệt danh sách' },
            { path: '/ctsv/khieu-nai', icon: MessageSquareWarning, label: 'Xử lý khiếu nại' }
        ],
        'DaoTao': [
            { path: '/dao-tao', icon: Home, label: 'Trang chủ Đào tạo' },
            { path: '/dao-tao/danh-sach', icon: FileSpreadsheet, label: 'Cung cấp điểm học vụ' }
        ],
        'Khoa': [
            { path: '/khoa', icon: Home, label: 'Trang chủ Khoa' },
            { path: '/khoa/de-xuat', icon: ClipboardList, label: 'Lập danh sách đề xuất' },
            { path: '/khoa/khieu-nai', icon: MessageSquareWarning, label: 'Xử lý khiếu nại' }
        ],
        'HDXD': [
            { path: '/hdxd', icon: Home, label: 'Trang chủ Hội đồng' },
            { path: '/hdxd/xet-chon', icon: ShieldCheck, label: 'Xét chọn sinh viên' },
            { path: '/hdxd/minh-chung', icon: FileText, label: 'Xem hồ sơ minh chứng' }
        ],
        'KHTC': [
            { path: '/tai-chinh', icon: Home, label: 'Trang chủ Tài chính' },
            { path: '/tai-chinh/kinh-phi', icon: Landmark, label: 'Kinh phí học bổng' }
        ],
        'HieuTruong': [
            { path: '/hieu-truong', icon: Home, label: 'Trang chủ BGH' },
            { path: '/hieu-truong/phe-duyet', icon: CheckSquare, label: 'Phê duyệt danh sách' },
            { path: '/hieu-truong/lich-su', icon: History, label: 'Lịch sử chi học bổng' }
        ]
    };

    const currentMenus = menuConfig[activeRole] || menuConfig['SinhVien'];

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 transition-all duration-300 flex-shrink-0">
                <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-200">
                    <div className="bg-slate-800 p-1.5 rounded-lg flex-shrink-0">
                        <GraduationCap className="text-white w-5 h-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="font-bold text-sm text-gray-900 truncate">HỌC BỔNG UTE</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold truncate">
                            {roleDisplayNames[activeRole] || activeRole}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 py-4 overflow-y-auto px-3 custom-scrollbar flex flex-col gap-1">
                    <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Danh mục</p>
                    <ul className="space-y-1">
                        {currentMenus.map((menu, index) => {
                            const Icon = menu.icon;
                            const isActive = location.pathname === menu.path;
                            return (
                                <li key={index}>
                                    <Link
                                        to={menu.path}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                        <span>{menu.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-3 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} className="text-gray-400" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* HEADER */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-lg font-semibold text-gray-900 leading-tight">Hệ thống Quản lý Học bổng</h2>
                        <p className="text-xs text-gray-500 hidden sm:block">
                            Trường Đại học Sư phạm Kỹ thuật - ĐHĐN
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors focus:outline-none">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="hidden sm:flex flex-col text-right">
                                <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {activeRole === 'SinhVien' ? 'Huỳnh Minh Dũng' : 'Cán bộ Hệ thống'}
                                </span>
                                <span className="text-xs text-gray-500">{roleDisplayNames[activeRole]}</span>
                            </div>

                            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-medium">
                                {activeRole === 'SinhVien' ? 'SV' : 'CB'}
                            </div>

                            <ChevronDown className="text-gray-400 w-4 h-4" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;