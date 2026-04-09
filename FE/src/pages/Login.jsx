import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('SinhVien');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mô phỏng logic đăng nhập: Chuyển hướng người dùng dựa trên role đã chọn
        const routeMap = {
            'SinhVien': '/sinh-vien',
            'CTSV': '/ctsv',
            'DaoTao': '/dao-tao',
            'Khoa': '/khoa',
            'HDXD': '/hdxd',
            'KHTC': '/tai-chinh',
            'HieuTruong': '/hieu-truong'
        };
        navigate(routeMap[role]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Vòng tròn trang trí Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-teal-500/20 rounded-full blur-3xl"></div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <div className="bg-white p-3 rounded-2xl inline-block mb-4 shadow-lg">
                        <Award className="text-blue-700 w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">UTE SCHOLAR</h1>
                    <p className="text-blue-200 mt-2 text-sm">Hệ thống xét duyệt học bổng trực tuyến</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Dropdown chọn tác nhân */}
                    <div>
                        <label className="block text-sm font-medium text-blue-100 mb-1.5">Bạn đăng nhập với tư cách:</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <ShieldCheck className="h-5 w-5 text-blue-300" />
                            </div>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-blue-300/30 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none appearance-none transition-all cursor-pointer font-medium"
                            >
                                <option value="SinhVien" className="text-gray-900">🎓 Sinh viên</option>
                                <option value="CTSV" className="text-gray-900">🏢 Phòng Công tác Sinh viên</option>
                                <option value="Khoa" className="text-gray-900">📚 Ban Chủ nhiệm Khoa</option>
                                <option value="DaoTao" className="text-gray-900">📖 Phòng Đào tạo</option>
                                <option value="HDXD" className="text-gray-900">⚖️ Hội đồng Xét duyệt</option>
                                <option value="KHTC" className="text-gray-900">💰 Phòng Kế hoạch - Tài chính</option>
                                <option value="HieuTruong" className="text-gray-900">👑 Hiệu trưởng</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-100 mb-1.5">Tên đăng nhập / MSSV</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-blue-300" />
                            </div>
                            <input type="text" placeholder="Nhập tài khoản của bạn..." className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-blue-300/30 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-100 mb-1.5">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-blue-300" />
                            </div>
                            <input type="password" placeholder="••••••••" className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-blue-300/30 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all" required />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-blue-200 cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" /> Ghi nhớ đăng nhập
                        </label>
                        <a href="#" className="text-blue-300 hover:text-white font-medium transition-colors">Quên mật khẩu?</a>
                    </div>

                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                        Đăng nhập hệ thống <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;