import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, BookOpen, Award, Loader2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const StudentProfile = () => {
    const [student, setStudent] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profileRes = await api.get('/api/sinhvien/profile');
                if (profileRes.data.success) {
                    setStudent(profileRes.data.data);
                }

                const historyRes = await api.get('/api/sinhvien/tracuu');
                if (historyRes.data.success) {
                    setHistory(historyRes.data.data);
                }
            } catch (err) {
                console.error("Lỗi tải thông tin cá nhân:", err);
                setError("Không thể tải thông tin cá nhân. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-gray-400" />
                <p className="text-sm font-medium">Đang tải dữ liệu hồ sơ...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex items-start gap-3 max-w-3xl mx-auto">
                <AlertCircle size={24} className="mt-0.5 shrink-0" />
                <div>
                    <h3 className="font-semibold text-base mb-1">Không thể hiển thị hồ sơ</h3>
                    <p className="text-sm opacity-90">{error || "Không tìm thấy thông tin sinh viên trên hệ thống."}</p>
                </div>
            </div>
        );
    }

    const awards = history
        .filter(h => h.trangThai === 'ChinhThuc')
        .map(h => `Học bổng ${h.xepLoaiHB} - ${h.tenDot || 'Kỳ học'}`);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Profile Section */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Minimalist Avatar */}
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-white text-3xl font-medium shrink-0">
                    {student.hoTen ? student.hoTen.split(' ').pop().charAt(0) : 'U'}
                </div>

                <div className="flex-1 text-center md:text-left pt-2">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">{student.hoTen}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                            <GraduationCap size={16} /> {student.maSV}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                            <BookOpen size={16} /> {student.tenKhoa}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thông tin liên hệ & Chi tiết */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <User className="text-gray-400" size={20} /> Thông tin chi tiết
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            {/* Cột 1 */}
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <Mail size={14} /> Email
                                    </p>
                                    <p className="text-gray-900">{student.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <Phone size={14} /> Số điện thoại
                                    </p>
                                    <p className="text-gray-900">{student.sdt || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            {/* Cột 2 */}
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <MapPin size={14} /> Ngày sinh
                                    </p>
                                    <p className="text-gray-900">
                                        {student.ngaySinh ? new Date(student.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <Calendar size={14} /> Lớp
                                    </p>
                                    <p className="text-gray-900">{student.tenLop}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <Award className="text-gray-400" size={20} /> Thành tích & Học bổng
                        </h2>
                        <ul className="space-y-0">
                            {awards.length === 0 ? (
                                <li className="text-gray-500 text-sm py-4">
                                    Chưa có ghi nhận học bổng chính thức trong hệ thống.
                                </li>
                            ) : (
                                awards.map((award, i) => (
                                    <li key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                                        <Award size={18} className="text-slate-600 mt-0.5" />
                                        <span className="text-gray-800">{award}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                {/* Thống kê học tập - Đơn giản hóa */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm text-center">
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">GPA Trung bình</p>
                        <h3 className="text-5xl font-bold text-slate-800 tracking-tight">
                            {student.gpa != null ? Number(student.gpa).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-,--'}
                        </h3>
                        {/* Giả định UI cho thanh hiển thị điểm */}
                        <div className="mt-6 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800 rounded-full" style={{ width: `${(student.gpa / 4) * 100}%` }}></div>
                        </div>
                        <p className="mt-3 text-gray-500 text-xs">Điểm hệ 4.0</p>
                    </div>

                    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Tiến độ kỳ xét</p>
                                <span className="text-3xl font-bold text-slate-800">{student.tinChiKyXet}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-500 mb-1">/ 25 tín chỉ</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((student.tinChiKyXet / 25) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;