import React, { useState } from 'react';
import {
    Database, Send, CheckCircle, Search,
    Filter, Users, BookOpen, GraduationCap, Download, ArrowRight, Loader2
} from 'lucide-react';

const DaoTaoDashboard = () => {
    // Trạng thái trích xuất: 'idle', 'loading', 'done', 'transferred'
    const [status, setStatus] = useState('idle');
    const [searchTerm, setSearchTerm] = useState('');

    // Dữ liệu mock
    const mockStudents = [
        { id: '23115053122108', name: 'Huỳnh Minh Dũng', class: '23T1', gpa: 3.8, credits: 18 },
        { id: '23115053122109', name: 'Nguyễn Văn An', class: '23T1', gpa: 3.5, credits: 15 },
        { id: '23115053122110', name: 'Trần Thị Bé', class: '23T2', gpa: 3.2, credits: 16 },
        { id: '23115053122111', name: 'Lê Hoàng Hải', class: '23T2', gpa: 3.9, credits: 21 },
        { id: '23115053122112', name: 'Phạm Đăng Duẩn', class: '23T3', gpa: 3.6, credits: 18 },
        { id: '23115053122113', name: 'Hoàng Tú Anh', class: '23T4', gpa: 3.7, credits: 19 },
    ];

    const handleExtract = () => {
        setStatus('loading');
        setTimeout(() => setStatus('done'), 1500);
    };

    const handleTransferCTSV = () => {
        setStatus('transferred');
    };

    const filteredStudents = mockStudents.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.includes(searchTerm)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Database className="text-blue-600" size={24} />
                        Phòng Đào tạo
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Khởi tạo và cung cấp dữ liệu học thuật làm cơ sở xét duyệt học bổng.
                    </p>
                </div>
                {status === 'transferred' && (
                    <span className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-green-200">
                        <CheckCircle size={18} /> Đã đồng bộ sang CTSV
                    </span>
                )}
            </div>

            {/* Khung cấu hình trích xuất */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                    <Filter size={18} className="text-gray-400" />
                    <h3 className="text-base font-semibold text-gray-900">Cấu hình điều kiện học thuật</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Học kỳ / Năm học</label>
                        <select
                            disabled={status === 'loading' || status === 'transferred'}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors text-sm text-gray-700 disabled:bg-gray-50 disabled:text-gray-500"
                        >
                            <option>Học kỳ 1 - 2025-2026</option>
                            <option>Học kỳ 2 - 2024-2025</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">GPA tối thiểu (&ge;)</label>
                        <input
                            type="number"
                            step="0.1"
                            defaultValue="2.5"
                            disabled={status === 'loading' || status === 'transferred'}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors text-sm text-gray-700 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Số Tín chỉ tối thiểu</label>
                        <input
                            type="number"
                            defaultValue="15"
                            disabled={status === 'loading' || status === 'transferred'}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors text-sm text-gray-700 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleExtract}
                            disabled={status === 'loading' || status === 'transferred'}
                            className={`w-full px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 h-[38px]
                                ${status === 'loading' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' :
                                    status === 'transferred' ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' :
                                        'bg-blue-600 hover:bg-blue-700 text-white border border-transparent shadow-sm'
                                }`}
                        >
                            {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                            {status === 'loading' ? 'Đang quét...' : status === 'transferred' ? 'Đã trích xuất' : 'Trích xuất dữ liệu'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Khu vực Kết quả */}
            {(status === 'done' || status === 'transferred') && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Thống kê nhanh */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">SV Đạt chuẩn</p>
                                <h3 className="text-2xl font-bold text-gray-900">1,245</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">GPA Trung bình</p>
                                <h3 className="text-2xl font-bold text-gray-900">3.42</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Điều kiện Tín chỉ</p>
                                <h3 className="text-2xl font-bold text-gray-900">&ge; 15 TC</h3>
                            </div>
                        </div>
                    </div>

                    {/* Bảng Dữ liệu trích xuất */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Toolbar */}
                        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                            <div className="relative flex-1 md:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm MSSV, Họ tên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Download size={16} className="text-gray-400" /> Xuất Excel
                                </button>
                                {status === 'done' && (
                                    <button
                                        onClick={handleTransferCTSV}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                                    >
                                        <Send size={16} /> Chuyển sang CTSV <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">MSSV</th>
                                        <th className="px-6 py-3">Họ và Tên</th>
                                        <th className="px-6 py-3">Lớp</th>
                                        <th className="px-6 py-3 text-right">Tín Chỉ ĐK</th>
                                        <th className="px-6 py-3 text-right">GPA</th>
                                        <th className="px-6 py-3 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                Không tìm thấy sinh viên nào khớp với điều kiện.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((sv) => (
                                            <tr key={sv.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{sv.id}</td>
                                                <td className="px-6 py-4">{sv.name}</td>
                                                <td className="px-6 py-4">{sv.class}</td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">{sv.credits}</td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                    {sv.gpa != null ? Number(sv.gpa).toFixed(2) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                        Đạt điều kiện
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
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