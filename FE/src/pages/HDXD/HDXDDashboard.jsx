import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, UserX, CheckCircle, AlertTriangle, Users, GraduationCap, Award } from 'lucide-react';
import finalDecisionService from '../../services/finalDecisionService';
import { useSelection } from '../../utils/useSelection';

const HDXDDashboard = () => {
    const [hoSos, setHoSos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudentToReject, setSelectedStudentToReject] = useState(null);

    // 1. Khởi tạo Hook quản lý Checkbox
    const { selectedIds, toggleSelection, selectAll, clearSelection, isAllSelected } = useSelection(hoSos);

    // 2. Load dữ liệu
    const fetchHoSo = async () => {
        try {
            const res = await finalDecisionService.getTongHopToanTruong();
            if (res.success) {
                setHoSos(res.data);
                const allIds = res.data.map(hs => hs.maHoSo);
                if (allIds.length > 0 && selectedIds.length === 0) {
                    allIds.forEach(id => toggleSelection(id));
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchHoSo();
    }, []);

    // 3. Hàm gửi danh sách
    const handleApprove = async () => {
        if (selectedIds.length === 0) return alert("Vui lòng chọn ít nhất 1 sinh viên!");
        try {
            const res = await finalDecisionService.hoiDongXetChon(selectedIds);
            if (res.success) {
                alert("Đã chốt danh sách dự kiến thành công!");
                fetchHoSo();
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // 4. Tính toán thống kê nhanh (Làm dữ liệu đỡ nhàm chán)
    const stats = useMemo(() => {
        if (!hoSos.length) return { total: 0, selected: 0, avgGpa: 0, xuatSac: 0 };
        const avg = hoSos.reduce((sum, hs) => sum + (Number(hs.gpa) || 0), 0) / hoSos.length;
        const xuatSac = hoSos.filter(hs => hs.xepLoaiHB === 'Xuất sắc' || hs.xepLoaiHB === 'XuatSac').length;
        return {
            total: hoSos.length,
            selected: selectedIds.length,
            avgGpa: avg.toFixed(2),
            xuatSac
        };
    }, [hoSos, selectedIds]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" size={24} />
                        Hội đồng Xét duyệt
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Thẩm định danh sách đề xuất và phê duyệt kết quả học bổng cuối cùng.
                    </p>
                </div>
                <button
                    onClick={handleApprove}
                    disabled={selectedIds.length === 0}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm
                        ${selectedIds.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-green-600 hover:bg-green-700 text-white border border-transparent'}`}
                >
                    <CheckCircle size={18} />
                    Chốt danh sách ({selectedIds.length})
                </button>
            </div>

            {/* Quick Stats Overview - Điểm nhấn UI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Tổng hồ sơ trình</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Đang chọn duyệt</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.selected}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <GraduationCap size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">GPA Trung bình</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.avgGpa}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        <Award size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Loại Xuất sắc</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.xuatSac}</h3>
                    </div>
                </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-center w-16">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        checked={isAllSelected && hoSos.length > 0}
                                        onChange={isAllSelected ? clearSelection : selectAll}
                                    />
                                </th>
                                <th className="px-6 py-4">Sinh viên</th>
                                <th className="px-6 py-4 text-right">GPA</th>
                                <th className="px-6 py-4 text-right">Đ. Rèn luyện</th>
                                <th className="px-6 py-4 text-center">Xếp Loại</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {hoSos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        Không có dữ liệu hồ sơ chờ duyệt.
                                    </td>
                                </tr>
                            ) : (
                                hoSos.map((hs) => (
                                    <tr key={hs.maHoSo} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                checked={selectedIds.includes(hs.maHoSo)}
                                                onChange={() => toggleSelection(hs.maHoSo)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-xs shrink-0">
                                                    SV
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{hs.hoTen}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{hs.maSV} • Lớp {hs.tenLop}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {hs.gpa != null ? Number(hs.gpa).toFixed(2) : '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {hs.diemRenLuyen || 0}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                {hs.xepLoaiHB}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedStudentToReject(hs);
                                                    setShowModal(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Loại khỏi danh sách"
                                            >
                                                <UserX size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal cảnh báo chuẩn Enterprise */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Loại bỏ sinh viên?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Bỏ chọn sinh viên <span className="font-semibold text-gray-700">{selectedStudentToReject?.hoTen}</span> khỏi danh sách phê duyệt hiện tại?
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedIds.includes(selectedStudentToReject.maHoSo)) {
                                            toggleSelection(selectedStudentToReject.maHoSo);
                                        }
                                        setShowModal(false);
                                    }}
                                    className="flex-1 py-2 px-4 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 border border-transparent transition-colors"
                                >
                                    Xác nhận bỏ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HDXDDashboard;