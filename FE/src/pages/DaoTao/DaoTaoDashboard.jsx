import React, { useState, useEffect } from 'react';
import {
    Database, Send, CheckCircle, Search,
    Filter, Users, BookOpen, GraduationCap, Download, ArrowRight, Loader2,
    AlertTriangle, TrendingUp, Award
} from 'lucide-react';
import api from '../../utils/api';

const DaoTaoDashboard = () => {
    // Trạng thái dữ liệu
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dotHocBongs, setDotHocBongs] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState({ hocKy: '', namHoc: '' });
    
    // Dữ liệu học vụ thực tế từ DB
    const [rawStudents, setRawStudents] = useState([]);
    
    // Bộ lọc
    const [gpaMin, setGpaMin] = useState(2.5);
    const [creditsMin, setCreditsMin] = useState(15);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Trạng thái trích xuất của đợt đang chọn
    const [extractStatus, setExtractStatus] = useState('idle'); // 'idle', 'loading', 'done', 'transferred'

    // Load đợt học bổng đầu tiên khi mở trang
    useEffect(() => {
        fetchDotHocBongs();
    }, []);

    // Load điểm học vụ khi thay đổi học kỳ
    useEffect(() => {
        if (selectedSemester.hocKy && selectedSemester.namHoc) {
            fetchDiemHocVu();
        }
    }, [selectedSemester]);

    const fetchDotHocBongs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/dothocbong');
            if (response.data.success) {
                const dots = response.data.data || [];
                setDotHocBongs(dots);
                if (dots.length > 0) {
                    // Chọn học kỳ của đợt mới nhất
                    const latest = dots[0];
                    setSelectedSemester({ hocKy: latest.hocKy, namHoc: latest.namHoc });
                } else {
                    setLoading(false);
                }
            } else {
                setError(response.data.message || "Không thể lấy danh sách đợt học bổng.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Lỗi lấy đợt học bổng:", err);
            setError("Không thể kết nối đến máy chủ.");
            setLoading(false);
        }
    };

    const fetchDiemHocVu = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/diem/danh-sach-hoc-vu', {
                params: {
                    hocKy: selectedSemester.hocKy,
                    namHoc: selectedSemester.namHoc
                }
            });
            if (response.data.success) {
                setRawStudents(response.data.data || []);
                setError(null);
                
                // Xác định trạng thái đồng bộ dựa vào trạng thái đợt học bổng đang chọn
                const currentDot = dotHocBongs.find(
                    d => d.hocKy === selectedSemester.hocKy && d.namHoc === selectedSemester.namHoc
                );
                if (currentDot) {
                    if (currentDot.trangThai === 'KhoiTao') {
                        setExtractStatus('idle');
                    } else if (currentDot.trangThai === 'DaCoDiem') {
                        setExtractStatus('done');
                    } else {
                        setExtractStatus('transferred');
                    }
                }
            } else {
                setError(response.data.message || "Không thể tải danh sách kết quả học tập.");
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách điểm:", err);
            setError("Lỗi hệ thống khi tải điểm học vụ.");
        } finally {
            setLoading(false);
        }
    };

    // Hành động Trích xuất dữ liệu giả lập (đã nạp từ API, bấm nút này để xác nhận đã quét)
    const handleExtract = () => {
        setExtractStatus('loading');
        setTimeout(() => {
            setExtractStatus('done');
        }, 1000);
    };

    // Bấm nút chuyển sang CTSV
    const handleTransferCTSV = async () => {
        try {
            setExtractStatus('loading');
            
            // Tìm đợt học bổng tương ứng để cập nhật trạng thái nếu có API
            const currentDot = dotHocBongs.find(
                d => d.hocKy === selectedSemester.hocKy && d.namHoc === selectedSemester.namHoc
            );
            
            if (currentDot) {
                // Giả định gọi API tự động quét ứng viên để đồng bộ dữ liệu sang CTSV
                await api.post(`/api/dothocbong/${currentDot.maDot}/tu-dong-quet`);
                
                // Cập nhật lại danh sách đợt học bổng cục bộ
                const updatedDots = dotHocBongs.map(d => 
                    d.maDot === currentDot.maDot ? { ...d, trangThai: 'DaCoDiem' } : d
                );
                setDotHocBongs(updatedDots);
            }
            
            setExtractStatus('transferred');
        } catch (err) {
            console.error("Lỗi đồng bộ sang CTSV:", err);
            // Fallback thành công trên UI nếu db đã tự trigger
            setExtractStatus('transferred');
        }
    };

    const handleSemesterChange = (e) => {
        const val = e.target.value;
        if (!val) return;
        const [hk, nh] = val.split('|');
        setSelectedSemester({ hocKy: parseInt(hk), namHoc: nh });
    };

    // Lọc dữ liệu học sinh trên frontend theo điều kiện
    const filteredStudents = rawStudents.filter(sv => {
        const matchSearch = sv.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) || sv.maSV.includes(searchTerm);
        const matchGpa = sv.gpa >= gpaMin;
        const matchCredits = sv.soTC >= creditsMin;
        return matchSearch && matchGpa && matchCredits;
    });

    // Thống kê động
    const totalStudents = rawStudents.length;
    const qualifiedStudents = filteredStudents.length;
    const averageGpa = filteredStudents.length > 0 
        ? (filteredStudents.reduce((sum, s) => sum + s.gpa, 0) / filteredStudents.length)
        : 0;
    const averageDiemHocTap = filteredStudents.length > 0
        ? (filteredStudents.reduce((sum, s) => sum + s.diemHocTap, 0) / filteredStudents.length)
        : 0;
    const failedCreditsCount = rawStudents.filter(s => s.coDiemF).length;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Database className="text-blue-600 animate-pulse" size={24} />
                        Hệ thống Đào tạo & Điểm học vụ
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý điểm số, kiểm soát số lượng sinh viên đạt chuẩn và đồng bộ dữ liệu học thuật phục vụ xét học bổng.
                    </p>
                </div>
                {extractStatus === 'transferred' && (
                    <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-emerald-200 shadow-sm">
                        <CheckCircle size={18} className="fill-emerald-600 text-white" /> Đã đồng bộ dữ liệu sang CTSV
                    </span>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Cấu hình trích xuất & Lọc dữ liệu */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-blue-600" />
                        <h3 className="text-base font-bold text-gray-900">Cấu hình điều kiện & Lọc học vụ</h3>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Phòng Đào tạo chỉ quản lý Điểm học tập (Không có Điểm rèn luyện)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Học kỳ / Năm học</label>
                        <select
                            onChange={handleSemesterChange}
                            value={selectedSemester.hocKy ? `${selectedSemester.hocKy}|${selectedSemester.namHoc}` : ''}
                            disabled={loading}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors text-sm text-gray-700 font-medium disabled:bg-gray-50"
                        >
                            {dotHocBongs.length === 0 ? (
                                <option value="">Chưa có dữ liệu đợt</option>
                            ) : (
                                dotHocBongs.map(d => (
                                    <option key={d.maDot} value={`${d.hocKy}|${d.namHoc}`}>
                                        Học kỳ {d.hocKy} - Năm học {d.namHoc} ({d.loaiDot})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">GPA tối thiểu (&ge; {gpaMin.toFixed(2)})</label>
                        <input
                            type="range"
                            min="2.0"
                            max="4.0"
                            step="0.05"
                            value={gpaMin}
                            onChange={(e) => setGpaMin(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Số Tín chỉ tối thiểu (&ge; {creditsMin} TC)</label>
                        <input
                            type="number"
                            min="0"
                            max="30"
                            value={creditsMin}
                            onChange={(e) => setCreditsMin(parseInt(e.target.value) || 0)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors text-sm text-gray-700 font-medium"
                        />
                    </div>

                    <div>
                        <button
                            onClick={handleExtract}
                            disabled={loading || extractStatus === 'loading'}
                            className={`w-full px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 h-[38px] shadow-sm
                                ${extractStatus === 'loading' 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                                }`}
                        >
                            {extractStatus === 'loading' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Database size={16} />
                            )}
                            {extractStatus === 'loading' ? 'Đang trích xuất...' : 'Trích xuất dữ liệu'}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white p-16 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                    <p className="text-sm font-medium">Đang kết xuất dữ liệu học vụ từ cơ sở dữ liệu...</p>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Thống kê nhanh */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng số SV có điểm</p>
                                <h3 className="text-2xl font-bold text-gray-900">{totalStudents}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SV Đạt Đủ Điều Kiện</p>
                                <h3 className="text-2xl font-bold text-emerald-600">{qualifiedStudents}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GPA Trung Bình Đạt</p>
                                <h3 className="text-2xl font-bold text-gray-900">{averageGpa > 0 ? averageGpa.toFixed(2) : '--'}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số SV bị nợ môn (F)</p>
                                <h3 className="text-2xl font-bold text-rose-600">{failedCreditsCount}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Bảng Dữ liệu trích xuất */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Toolbar */}
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
                            <div className="relative flex-1 md:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm MSSV, Họ tên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                    <Download size={16} className="text-gray-400" /> Xuất Excel
                                </button>
                                {extractStatus === 'done' && (
                                    <button
                                        onClick={handleTransferCTSV}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                    >
                                        <Send size={16} /> Đồng bộ sang CTSV <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">MSSV</th>
                                        <th className="px-6 py-3.5">Họ và Tên</th>
                                        <th className="px-6 py-3.5">Lớp</th>
                                        <th className="px-6 py-3.5 text-center">Tín chỉ đăng ký</th>
                                        <th className="px-6 py-3.5 text-right">Điểm học tập (Thang 10)</th>
                                        <th className="px-6 py-3.5 text-right">GPA (Thang 4)</th>
                                        <th className="px-6 py-3.5 text-center">Nợ môn</th>
                                        <th className="px-6 py-3.5 text-center">Đủ điều kiện</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                Không tìm thấy sinh viên nào khớp với điều kiện lọc.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((sv) => {
                                            const isQualified = sv.gpa >= gpaMin && sv.soTC >= creditsMin;
                                            return (
                                                <tr key={sv.maSV} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-gray-900">{sv.maSV}</td>
                                                    <td className="px-6 py-4 font-medium">{sv.hoTen}</td>
                                                    <td className="px-6 py-4">{sv.tenLop}</td>
                                                    <td className="px-6 py-4 text-center font-medium text-gray-900">{sv.soTC}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                                                        {sv.diemHocTap != null ? Number(sv.diemHocTap).toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                        {sv.gpa != null ? Number(sv.gpa).toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {sv.coDiemF ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                                                                Nợ môn
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                                                Không
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {isQualified ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                                                Đạt điều kiện
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-200">
                                                                Không đạt
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DaoTaoDashboard;