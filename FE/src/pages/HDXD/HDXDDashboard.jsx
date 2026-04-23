import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserX, CheckCircle, AlertTriangle } from 'lucide-react';
import finalDecisionService from '../../services/finalDecisionService';
import { useSelection } from '../../utils/useSelection';

const HDXDDashboard = () => {
    const [hoSos, setHoSos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudentToReject, setSelectedStudentToReject] = useState(null);

    // 1. Khởi tạo Hook quản lý Checkbox
    const { selectedIds, toggleSelection, selectAll, clearSelection, isAllSelected } = useSelection(hoSos);

    // 2. Load dữ liệu từ Backend khi mở trang
    const fetchHoSo = async () => {
        try {
            const res = await finalDecisionService.layTongHopToanTruong();
            if (res.success) {
                setHoSos(res.data);
                // Tích chọn sẵn tất cả sinh viên
                const allIds = res.data.map(hs => hs.maHoSo);
                // Trick nhỏ gọi hàm tự động
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

    // 3. Hàm gửi danh sách ID lên BE để duyệt
    const handleApprove = async () => {
        if (selectedIds.length === 0) return alert("Vui lòng chọn ít nhất 1 sinh viên!");
        try {
            const res = await finalDecisionService.hoiDongXetChon(selectedIds);
            if (res.success) {
                alert("Đã chốt danh sách dự kiến thành công!");
                fetchHoSo(); // Load lại bảng
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Hội đồng Xét duyệt</h2>
                    <p className="text-gray-500 mt-1">Thẩm định danh sách và phê duyệt kết quả cuối cùng.</p>
                </div>
                <button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                >
                    <CheckCircle size={20} /> Chốt danh sách duyệt ({selectedIds.length} SV)
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="p-6 text-center w-16">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 cursor-pointer rounded border-gray-300"
                                    checked={isAllSelected}
                                    onChange={isAllSelected ? clearSelection : selectAll}
                                />
                            </th>
                            <th className="p-6 font-bold text-gray-700 text-sm uppercase">Sinh viên</th>
                            <th className="p-6 font-bold text-gray-700 text-sm uppercase text-center">GPA / ĐRL</th>
                            <th className="p-6 font-bold text-gray-700 text-sm uppercase text-center">Xếp Loại</th>
                            <th className="p-6 font-bold text-gray-700 text-sm uppercase text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {hoSos.length === 0 ? (
                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">Chưa có hồ sơ chờ duyệt</td></tr>
                        ) : (
                            hoSos.map((hs) => (
                                <tr key={hs.maHoSo} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="p-6 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 cursor-pointer rounded border-gray-300"
                                            checked={selectedIds.includes(hs.maHoSo)}
                                            onChange={() => toggleSelection(hs.maHoSo)}
                                        />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold">SV</div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-base">{hs.hoTen}</p>
                                                <p className="text-xs text-gray-500 font-medium">MSSV: {hs.maSV} - Lớp: {hs.tenLop}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className="font-bold text-gray-800">{Number(hs.gpa).toFixed(2)}</span> <span className="text-gray-400">/</span> <span className="font-bold text-gray-800">{hs.diemRenLuyen || 0}</span>
                                    </td>

                                    <td className="p-6 text-center">
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{hs.xepLoaiHB}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => {
                                                setSelectedStudentToReject(hs);
                                                setShowModal(true);
                                            }} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                                <UserX size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal cảnh báo loại SV */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Loại bỏ sinh viên?</h3>
                        <p className="text-gray-500 mt-2">Bạn có chắc muốn bỏ chọn SV <b>{selectedStudentToReject?.hoTen}</b> khỏi danh sách duyệt không?</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Hủy</button>
                            <button onClick={() => {
                                if (selectedIds.includes(selectedStudentToReject.maHoSo)) {
                                    toggleSelection(selectedStudentToReject.maHoSo);
                                }
                                setShowModal(false);
                            }} className="flex-1 py-3 font-bold bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-all">Xác nhận bỏ chọn</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HDXDDashboard;
