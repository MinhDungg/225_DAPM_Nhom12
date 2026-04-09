import React, { useState } from 'react';
import {
    ClipboardList, PieChart, Users, Search,
    CheckCircle, XCircle, Send, Filter, Award
} from 'lucide-react';

const KhoaDashboard = () => {
    // 1. MÔ PHỎNG DỮ LIỆU TỪ HỆ THỐNG (P.CTSV trả về)
    const [students, setStudents] = useState([
        { id: '23115053122108', name: 'Huỳnh Minh Dũng', class: '23T1', gpa: 3.8, drl: 90, rank: 'Xuất sắc', selected: true },
        { id: '23115053122109', name: 'Nguyễn Văn An', class: '23T1', gpa: 3.5, drl: 85, rank: 'Giỏi', selected: false },
        { id: '23115053122110', name: 'Trần Thị Bé', class: '23T2', gpa: 3.2, drl: 82, rank: 'Khá', selected: true },
        { id: '23115053122111', name: 'Lê Hoàng Hải', class: '23T2', gpa: 3.9, drl: 95, rank: 'Xuất sắc', selected: false },
        { id: '23115053122112', name: 'Phạm Đăng Duẩn', class: '23T3', gpa: 3.6, drl: 88, rank: 'Giỏi', selected: true },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    // 2. LOGIC TÍNH TOÁN NGÂN SÁCH & CHỈ TIÊU
    const totalBudget = 450000000; // 450 Triệu
    const maxQuota = 120; // 120 Suất

    // Đếm số lượng sinh viên đã được tích chọn
    const selectedCount = students.filter(s => s.selected).length;
    // Giả lập mỗi suất học bổng trung bình là 5.000.000 VNĐ
    const usedBudget = selectedCount * 5000000;

    // 3. HÀM XỬ LÝ SỰ KIỆN
    const toggleSelection = (id) => {
        setStudents(students.map(student =>
            student.id === id ? { ...student, selected: !student.selected } : student
        ));
    };

    // Lọc danh sách theo từ khóa tìm kiếm
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-5">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ban Chủ nhiệm Khoa</h2>
                    <p className="text-gray-500 mt-1.5">Tiến hành rà soát và lập danh sách đề xuất học bổng cấp Khoa.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition-all font-bold">
                    <Send size={18} /> Gửi danh sách lên Hội đồng
                </button>
            </div>

            {/* Thẻ thống kê (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <PieChart className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10" />
                    <div>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Ngân sách phân bổ</p>
                        <h4 className="text-3xl font-black mt-2">{totalBudget.toLocaleString('vi-VN')} đ</h4>
                    </div>
                    <div className="mt-6">
                        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                            <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(usedBudget / totalBudget) * 100}%` }}></div>
                        </div>
                        <p className="text-xs font-medium mt-2 text-blue-100">Đã đề xuất: {usedBudget.toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Users size={36} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chỉ tiêu SV Khoa</p>
                        <h3 className="text-3xl font-black text-gray-800 mt-1">{maxQuota} <span className="text-sm font-medium text-gray-500">Suất</span></h3>
                        <p className="text-sm text-green-600 font-bold mt-1">Đã chọn: {selectedCount} sinh viên</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="bg-amber-50 p-4 rounded-2xl text-amber-600"><ClipboardList size={36} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trạng thái báo cáo</p>
                        <h3 className="text-xl font-bold text-gray-800 mt-2">Đang soạn thảo</h3>
                        <p className="text-sm text-gray-500 mt-1">Hạn chót: 20/03/2026</p>
                    </div>
                </div>
            </div>

            {/* Khu vực Bảng dữ liệu */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Thanh công cụ tìm kiếm & lọc */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Award className="text-blue-600" size={20} /> Danh sách SV đủ điều kiện (Từ P.CTSV)
                    </h3>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm MSSV, Họ tên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                            <Filter size={16} /> Lọc
                        </button>
                    </div>
                </div>

                {/* Bảng chi tiết */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-white border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-bold text-gray-700">MSSV</th>
                                <th className="p-4 font-bold text-gray-700">Họ và Tên</th>
                                <th className="p-4 font-bold text-gray-700 text-center">Lớp</th>
                                <th className="p-4 font-bold text-gray-700 text-center">GPA / ĐRL</th>
                                <th className="p-4 font-bold text-gray-700 text-center">Xếp loại</th>
                                <th className="p-4 font-bold text-gray-700 text-center">Đề xuất nhận HB</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((sv) => (
                                <tr key={sv.id} className={`hover:bg-blue-50/30 transition-colors ${sv.selected ? 'bg-blue-50/20' : ''}`}>
                                    <td className="p-4 font-semibold text-gray-800">{sv.id}</td>
                                    <td className="p-4 font-semibold text-gray-800">{sv.name}</td>
                                    <td className="p-4 text-center">{sv.class}</td>
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-gray-900">{sv.gpa}</span> <span className="text-gray-400">/</span> {sv.drl}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${sv.rank === 'Xuất sắc' ? 'bg-purple-100 text-purple-700' :
                                                sv.rank === 'Giỏi' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {sv.rank}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => toggleSelection(sv.id)}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mx-auto transition-all ${sv.selected
                                                    ? 'bg-green-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {sv.selected ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {sv.selected ? 'Đã Đưa Vào DS' : 'Chọn Đề Xuất'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Không tìm thấy sinh viên nào phù hợp với từ khóa tìm kiếm.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default KhoaDashboard;