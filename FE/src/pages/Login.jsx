import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Loader2, GraduationCap } from 'lucide-react';
import api from '../utils/api'; // Đường dẫn đến file config axios của bạn

const Login = () => {
    const [tenDangNhap, setTenDangNhap] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Gọi API đăng nhập (Điều chỉnh endpoint khớp với Backend của bạn)
            const response = await api.post('/api/auth/login', {
                Username: tenDangNhap, // Sửa lại key cho khớp với BE
                Password: matKhau      // Sửa lại key cho khớp với BE
            });

            if (response.data.success) {
                const { token, userInfo, role } = response.data.data;

                // 2. Lưu Token và thông tin Actor vào sessionStorage
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('role', role);
                sessionStorage.setItem('userInfo', JSON.stringify(userInfo));

                // 3. Phân luồng điều hướng dựa vào VaiTro (Role) của Actor
                const vaiTro = role;

                switch (vaiTro) {
                    case 'SinhVien':
                        navigate('/sinh-vien'); // Chuyển đến StudentDashboard
                        break;
                    case 'Khoa':
                        navigate('/khoa'); // Chuyển đến KhoaDashboard
                        break;
                    case 'CTSV':
                        navigate('/ctsv'); // Chuyển đến CTSVDashboard
                        break;
                    case 'HieuTruong':
                        navigate('/hieu-truong'); // Chuyển đến HieuTruongDashboard
                        break;
                    case 'HoiDong':
                    case 'HDXD':
                        navigate('/hdxd'); // Chuyển đến HDXDDashboard
                        break;
                    case 'DaoTao':
                        navigate('/dao-tao'); // Chuyển đến DaoTaoDashboard
                        break;
                    case 'KHTC':
                    case 'TaiChinh':
                        navigate('/tai-chinh'); // Chuyển đến TaiChinhDashboard
                        break;
                    case 'Admin':
                        navigate('/admin');
                        break;
                    default:
                        setError('Tài khoản của bạn chưa được cấp quyền truy cập hệ thống.');
                        break;
                }
            } else {
                setError(response.data.message || 'Sai tên đăng nhập hoặc mật khẩu.');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra Backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center text-white mb-4">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30">
                        <GraduationCap size={48} className="text-white" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
                    Hệ thống xét duyệt học bổng
                </h2>
                <p className="mt-2 text-center text-sm text-blue-100">
                    Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">

                    {error && (
                        <div className="mb-6 flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
                            <AlertCircle size={18} className="shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Tên đăng nhập (Mã SV / Mã Cán bộ)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={tenDangNhap}
                                    onChange={(e) => setTenDangNhap(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="Nhập mã đăng nhập..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={matKhau}
                                    onChange={(e) => setMatKhau(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Đang xác thực...
                                    </>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;