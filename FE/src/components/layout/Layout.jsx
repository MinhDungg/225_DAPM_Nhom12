import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home, FileText, Bell, User, LogOut, ChevronDown,
    Database, Users, ShieldCheck, Landmark, FileCheck,
    ClipboardList, CheckSquare, MessageSquareWarning,
    GraduationCap, LifeBuoy
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

    const currentMenus = menuConfig[activeRole] || [];

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Tối ưu hóa Sidebar: Đổi màu nền sang Midnight Blue mượt mà hơn */}
            <aside className="w-72 bg-[#0A192F] text-white flex flex-col shadow-2xl z-20 relative overflow-hidden">
                {/* Hiệu ứng ánh sáng nền mờ */}
                <div className="absolute top-0 left-0 w-full h-40 bg-blue-600/20 blur-3xl pointer-events-none"></div>

                {/* Logo Area */}
                <div className="p-6 border-b border-slate-800/80 flex items-center gap-4 relative z-10">
                    <div className="bg-gradient-to-tr from-blue-500 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                        <GraduationCap className="text-white w-7 h-7" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-black text-xl tracking-wider text-white leading-tight">HỌC BỔNG UTE</h1>
                        <p className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-bold mt-1">
                            {roleDisplayNames[activeRole] || activeRole}
                        </p>
                    </div>
                </div>

                {/* Navigation Menus */}
                <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
                    <p className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Menu Chính</p>
                    <ul className="space-y-2">
                        {currentMenus.map((menu, index) => {
                            const Icon = menu.icon;
                            const isActive = location.pathname.includes(menu.path);

                            return (
                                <li key={index} className="relative">
                                    {/* Dấu gạch dọc phát sáng khi Active */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_12px_rgba(34,211,238,0.6)]"></div>
                                    )}
                                    <Link
                                        to={menu.path}
                                        className={`flex items-center gap-4 px-6 py-3.5 mx-4 rounded-xl transition-all duration-300 group ${isActive
                                                ? 'bg-blue-900/40 text-white font-bold border border-blue-700/50 shadow-inner'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium'
                                            }`}
                                    >
                                        <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'text-cyan-400' : 'group-hover:scale-110 group-hover:text-cyan-300'}`} />
                                        <span className="text-sm tracking-wide">{menu.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Thẻ Support lấp khoảng trống phía dưới (Rất tinh tế) */}
                    <div className="mx-6 mt-auto mb-4 bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/50 p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-cyan-400/20 transition-all duration-500"></div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-slate-700/50 p-2 rounded-lg">
                                <LifeBuoy size={18} className="text-cyan-400" />
                            </div>
                            <p className="font-bold text-sm text-white">Cần hỗ trợ?</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Hệ thống quản lý học bổng UTE. Liên hệ kỹ thuật nếu gặp sự cố.
                        </p>
                        <button className="w-full py-2.5 bg-slate-700/50 hover:bg-cyan-500 hover:text-white border border-slate-600 hover:border-cyan-400 rounded-xl text-xs font-bold text-slate-300 transition-all shadow-sm">
                            Gửi yêu cầu hỗ trợ
                        </button>
                    </div>
                </nav>

                {/* Nút Đăng xuất */}
                <div className="p-5 border-t border-slate-800/80 bg-[#071324] relative z-10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 border border-transparent transition-all duration-300 group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Đăng xuất hệ thống</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm relative z-10">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Hệ thống Quản lý Học bổng</h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Trường Đại học Sư phạm Kỹ thuật - ĐHĐN</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <div className="p-2 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors">
                                <Bell className="text-slate-500 group-hover:text-blue-600 transition-colors" size={22} />
                            </div>
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">3</span>
                        </div>

                        <div className="flex items-center gap-3 border-l pl-6 border-slate-200 cursor-pointer group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-black shadow-sm group-hover:shadow-md transition-all">
                                {activeRole === 'SinhVien' ? 'SV' : 'CB'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                                    {activeRole === 'SinhVien' ? 'Huỳnh Minh Dũng' : 'Cán bộ Hệ thống'}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">{roleDisplayNames[activeRole]}</span>
                            </div>
                            <ChevronDown className="text-slate-400 w-5 h-5 group-hover:text-blue-600 transition-colors ml-2" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;