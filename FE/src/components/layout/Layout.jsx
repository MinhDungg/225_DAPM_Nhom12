import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home, FileText, Bell, User, LogOut, ChevronDown,
    Database, Users, ShieldCheck, Landmark, FileCheck,
    ClipboardList, CheckSquare, MessageSquareWarning,
    GraduationCap, LifeBuoy, Sparkles
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
            { path: '/sinh-vien/thong-bao', icon: Bell, label: 'Thông báo & Danh sách' },
            { path: '/sinh-vien/khieu-nai', icon: MessageSquareWarning, label: 'Gửi khiếu nại' },
            { path: '/sinh-vien/ho-so', icon: User, label: 'Hồ sơ cá nhân' }
        ],
        'CTSV': [
            { path: '/ctsv', icon: Home, label: 'Tổng quan học bổng' },
            { path: '/ctsv/phan-bo', icon: Users, label: 'Phân bổ dữ liệu Khoa' },
            { path: '/ctsv/cong-bo', icon: Bell, label: 'Công bố danh sách' },
            { path: '/ctsv/trinh-duyet', icon: FileCheck, label: 'Trình duyệt danh sách' },
            { path: '/ctsv/khieu-nai', icon: MessageSquareWarning, label: 'Xử lý khiếu nại' }
        ],
        'DaoTao': [
            { path: '/dao-tao', icon: Home, label: 'Trang chủ Đào tạo' },
            { path: '/dao-tao/danh-sach', icon: Database, label: 'Cung cấp DS đủ điều kiện' }
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
            { path: '/hieu-truong/phe-duyet', icon: CheckSquare, label: 'Phê duyệt danh sách' }
        ]
    };

    const currentMenus = menuConfig[activeRole] || [];

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        // Nền tổng có màu xám/xanh rất nhạt, chứa các hình khối mờ (blur) để tôn lên hiệu ứng kính
        <div className="flex h-screen bg-[#F4F7FB] font-sans overflow-hidden relative">
            {/* Background Decoration Shapes */}
            <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-indigo-400/15 rounded-full blur-[80px] pointer-events-none"></div>

            {/* SIDEBAR: Glassmorphism Style */}
            <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-white/60 flex flex-col z-20 relative shadow-[4px_0_24px_rgba(148,163,184,0.1)] transition-all duration-300">

                {/* Logo Area */}
                <div className="p-6 flex items-center gap-4 relative z-10">
                    <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 transition-transform duration-300 hover:scale-105 hover:rotate-3 cursor-pointer">
                        <GraduationCap className="text-white w-7 h-7" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-xl tracking-tight text-slate-800 leading-tight">HỌC BỔNG UTE</h1>
                        <p className="text-[10px] text-blue-600 uppercase tracking-widest font-bold mt-1">
                            {roleDisplayNames[activeRole] || activeRole}
                        </p>
                    </div>
                </div>

                {/* Navigation Menus */}
                <nav className="flex-1 py-4 overflow-y-auto px-4 custom-scrollbar relative z-10 flex flex-col gap-1">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Menu Chính</p>
                    <ul className="space-y-1.5">
                        {currentMenus.map((menu, index) => {
                            const Icon = menu.icon;
                            const isActive = location.pathname === menu.path;
                            return (
                                <li key={index}>
                                    <Link
                                        to={menu.path}
                                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-medium translate-x-1'
                                            : 'text-slate-500 hover:bg-white/80 hover:text-blue-600 hover:shadow-sm hover:translate-x-1 font-medium'
                                            }`}
                                    >
                                        <Icon
                                            size={20}
                                            className={`transition-transform duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 group-hover:scale-110'}`}
                                        />
                                        <span className="text-sm tracking-wide">{menu.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Support Card (Tinh tế, sáng sủa) */}
                    <div className="mt-auto mb-2 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-100/50 p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:bg-blue-200/40 transition-all duration-500"></div>
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-100/50">
                                <Sparkles size={18} className="text-blue-500" />
                            </div>
                            <p className="font-bold text-sm text-slate-700">Cần hỗ trợ?</p>
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed mb-4 relative z-10">
                            Liên hệ đội ngũ kỹ thuật nếu bạn gặp sự cố trên hệ thống.
                        </p>
                        <button className="w-full py-2.5 bg-white hover:bg-blue-500 hover:text-white border border-blue-100 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-600 transition-all shadow-sm active:scale-95">
                            Gửi yêu cầu ngay
                        </button>
                    </div>
                </nav>

                {/* Nút Đăng xuất */}
                <div className="p-4 border-t border-slate-200/50 bg-white/30 relative z-10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 px-4 py-2.5 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-300 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Đăng xuất hệ thống</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col relative z-10 h-screen">

                {/* Header: Glassmorphism */}
                <header className="h-20 bg-white/60 backdrop-blur-md border-b border-white/80 flex items-center justify-between px-8 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] sticky top-0 z-20">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Hệ thống Quản lý Học bổng</h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Trường Đại học Sư phạm Kỹ thuật - ĐHĐN
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative group cursor-pointer">
                            <div className="p-2.5 bg-white/80 border border-slate-100 rounded-full shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                                <Bell className="text-slate-500 group-hover:text-blue-600 transition-colors" size={20} />
                            </div>
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm ring-2 ring-red-500/20">3</span>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200/80 cursor-pointer group">
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                    {activeRole === 'SinhVien' ? 'Huỳnh Minh Dũng' : 'Cán bộ Hệ thống'}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">{roleDisplayNames[activeRole]}</span>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-50 border border-blue-200/60 flex items-center justify-center text-blue-700 font-black shadow-sm group-hover:shadow group-hover:scale-105 transition-all">
                                {activeRole === 'SinhVien' ? 'SV' : 'CB'}
                            </div>
                            <ChevronDown className="text-slate-400 w-4 h-4 group-hover:text-blue-600 transition-colors group-hover:translate-y-0.5" />
                        </div>
                    </div>
                </header>

                {/* Outlet Content Wrapper */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;