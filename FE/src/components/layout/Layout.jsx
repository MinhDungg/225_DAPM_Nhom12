import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, FileText, Bell, User, LogOut, Award, ChevronDown } from 'lucide-react';

const Layout = ({ role }) => {
    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar - Sử dụng gradient xanh đậm tinh tế */}
            <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl">
                <div className="p-5 border-b border-blue-700/50 flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                        <Award className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-xl tracking-tight">UTE SCHOLAR</h1>
                        <p className="text-[10px] text-blue-200 uppercase tracking-widest">{role}</p>
                    </div>
                </div>

                <nav className="flex-1 py-6">
                    <ul className="space-y-1.5 px-3">
                        <li>
                            <Link to="/" className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg bg-white/10 text-white font-semibold transition-all duration-300">
                                <Home size={22} /> Trang chủ Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-300 group">
                                <Bell size={22} className="group-hover:animate-pulse" /> Thông báo học bổng
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-300">
                                <FileText size={22} /> Hồ sơ cá nhân
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-blue-700/50 bg-blue-950/30">
                    <button className="flex items-center gap-3.5 px-4 py-2.5 w-full rounded-lg text-blue-100 hover:bg-red-500 hover:text-white transition-all duration-300">
                        <LogOut size={22} /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header hiện đại hơn */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-900">Cổng thông tin Học bổng</h2>
                        <p className="text-xs text-gray-400 mt-1">Hệ thống quản lý và xét duyệt trực tuyến</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Bell className="text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" size={26} />
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
                        </div>

                        <div className="flex items-center gap-3 border-l pl-6 border-gray-100 cursor-pointer group">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 font-extrabold shadow-inner">
                                SV
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">Huỳnh Minh Dũng</span>
                                <span className="text-xs text-gray-500">MSSV: 231150531...</span>
                            </div>
                            <ChevronDown className="text-gray-400 w-5 h-5 group-hover:text-blue-600 transition-colors" />
                        </div>
                    </div>
                </header>

                {/* NƠI RENDER CÁC DASHBOARD - TUYỆT ĐỐI KHÔNG XÓA OUTLET */}
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