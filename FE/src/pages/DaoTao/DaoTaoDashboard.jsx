import React, { useState } from 'react';
import {
    Database, Send, CheckCircle, Search,
    Filter, Users, BookOpen, GraduationCap, Download, ArrowRight
} from 'lucide-react';

const DaoTaoDashboard = () => {
    // Trạng thái trích xuất: 'idle' (chưa làm gì), 'loading' (đang chạy), 'done' (xong), 'transferred' (đã chuyển CTSV)
    const [status, setStatus] = useState('idle');
    const [searchTerm, setSearchTerm] = useState('');

    // Dữ liệu mock sinh viên (Sẽ xuất hiện sau khi bấm trích xuất)
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
        // Giả lập thời gian load 1.5s để nhìn cho thật
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
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-5">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Phòng Đào tạo</h2>
                    <p className="text-slate-500 mt-1.5">Khởi tạo và cung cấp dữ liệu học thuật làm cơ sở xét duyệt học bổng.</p>
                </div>
                {status === 'transferred' && (
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-green-200 shadow-sm">
                        <CheckCircle size={18} /> Đã đồng bộ dữ liệu cho Phòng CTSV
                    </span>
                )}
            </div>

            {/* Khung cấu hình trích xuất */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><Filter size={20} /></div>
                        <h3 className="text-xl font-bold text-slate-800">Cấu hình điều kiện học thuật</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Học kỳ / Năm học</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700">
                            <option>Học kỳ 1 - 2025-2026</option>
                            <option>Học kỳ 2 - 2024-2025</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">GPA tối thiểu (&gt;=)</label>
                        <input type="number" step="0.1" defaultValue="2.5" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Số Tín chỉ tối thiểu</label>
                        <input type="number" defaultValue="15" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700" />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleExtract}
                            disabled={status === 'loading' || status === 'transferred'}
                            className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 ${status === 'loading' ? 'bg-blue-400 text-white cursor-not-allowed' :
                                    status === 'transferred' ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed' :
                                        'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                }`}
                        >
                            <Database size={20} />
                            {status === 'loading' ? 'Đang quét dữ liệu...' : status === 'transferred' ? 'Đã trích xuất' : 'Bắt đầu trích xuất'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Khu vực Kết quả (Chỉ hiện khi đã bấm trích xuất) */}
            {(status === 'done' || status === 'transferred') && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">

                    {/* Thống kê nhanh */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Users size={28} /></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">SV Đạt chuẩn</p>
                                <h4 className="text-2xl font-black text-slate-800 mt-1">1,245</h4>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><GraduationCap size={28} /></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">GPA Trung bình</p>
                                <h4 className="text-2xl font-black text-slate-800 mt-1">3.42</h4>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                            <div className="bg-amber-50 p-4 rounded-2xl text-amber-600"><BookOpen size={28} /></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Khối lượng Tín chỉ</p>
                                <h4 className="text-2xl font-black text-slate-800 mt-1">&ge; 15 TC</h4>
                            </div>
                        </div>
                    </div>

                    {/* Bảng Dữ liệu trích xuất */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
                            <div className="relative flex-1 md:max-w-xs">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm MSSV, Tên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                                    <Download size={18} /> Xuất Excel
                                </button>
                                {status === 'done' && (
                                    <button
                                        onClick={handleTransferCTSV}
                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-emerald-200 transition-all active:scale-95"
                                    >
                                        <Send size={18} /> Chuyển dữ liệu sang CTSV <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-white border-b border-slate-100">
                                    <tr>
                                        <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs">MSSV</th>
                                        <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs">Họ và Tên</th>
                                        <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-center">Lớp</th>
                                        <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-center">Số Tín Chỉ ĐK</th>
                                        <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-center">Điểm TBC (GPA)</th>
                                        <th className="p-5 font-bold text-slate-700 uppercase tracking-wider text-xs text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredStudents.map((sv) => (
                                        <tr key={sv.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-5 font-semibold text-slate-800">{sv.id}</td>
                                            <td className="p-5 font-semibold text-slate-800">{sv.name}</td>
                                            <td className="p-5 text-center font-medium">{sv.class}</td>
                                            <td className="p-5 text-center font-bold text-slate-700">{sv.credits}</td>
                                            <td className="p-5 text-center font-black text-blue-700">{sv.gpa}</td>
                                            <td className="p-5 text-center">
                                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                                    Đạt điều kiện
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
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