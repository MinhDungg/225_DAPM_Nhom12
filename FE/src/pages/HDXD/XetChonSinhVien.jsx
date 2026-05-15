import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserX, AlertTriangle, CalendarClock } from 'lucide-react';
import finalDecisionService from '../../services/finalDecisionService';
import { exportHoiDongExcel, exportHoiDongPdf } from '../../utils/exportUtils';

const XetChonSinhVien = () => {
    const [hoSos, setHoSos] = useState([]);
    const [dsBacBo, setDsBacBo] = useState([]);
    const [dsDotHocBong, setDsDotHocBong] = useState([]);
    const [selectedMaDot, setSelectedMaDot] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedStudentToReject, setSelectedStudentToReject] = useState(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState("");
    const [selectedKhoa, setSelectedKhoa] = useState('Tất cả');
    const [exporting, setExporting] = useState(false);
    const handleExport = async (fn) => {
        setExporting(true);
        try { await fn(); }
        catch (e) { alert('Lỗi xuất file: ' + e.message); }
        finally { setExporting(false); }
    };
    const [searchQuery, setSearchQuery] = useState("");

    const fetchDots = async () => {
        try {
            const res = await finalDecisionService.layDsDotHocBong();
            if (res.success) {
                const dots = res.data.filter(d => d.trangThai !== 'KhoiTao' && d.trangThai !== 'DaCoDiem');
                setDsDotHocBong(dots);
                if (dots.length > 0) {
                    const activeDot = dots.find(d => d.trangThai === 'DangXetDuyet') || dots[0];
                    setSelectedMaDot(activeDot.maDot);
                }
            }
        } catch (error) { console.error(error); }
    };


    const fetchHoSo = async (maDot, currentDot) => {
        if (!maDot) return;
        try {
            const res = await finalDecisionService.getTongHopToanTruong(maDot);
            if (res.success) {
                const all = res.data;
                setHoSos(all.filter(hs => hs.trangThai !== 'TuChoi'));

                const readOnly = currentDot && currentDot.trangThai !== 'DangXetDuyet';
                if (readOnly) {
                    // Nếu là lịch sử, lấy danh sách bị bác bỏ từ server
                    setDsBacBo(all.filter(hs => hs.trangThai === 'TuChoi').map(hs => ({ ...hs, lyDo: hs.ghiChu || hs.lyDo || "Vi phạm cấp trường" })));
                } else {
                    const saved = localStorage.getItem('hdxd_ds_bac_bo');
                    setDsBacBo(saved ? JSON.parse(saved) : []);
                }
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchDots(); }, []);
    useEffect(() => {
        const currentDot = dsDotHocBong.find(d => d.maDot.toString() === selectedMaDot.toString());
        fetchHoSo(selectedMaDot, currentDot);
    }, [selectedMaDot, dsDotHocBong]);

    const isReadOnly = () => {
        const currentDot = dsDotHocBong.find(d => d.maDot.toString() === selectedMaDot.toString());
        return currentDot && currentDot.trangThai !== 'DangXetDuyet';
    };
    const danhSachKhoa = ['Tất cả', ...new Set(hoSos.map(h => h.tenKhoa).filter(Boolean))];
    const dsKhoaLoc = selectedKhoa === 'Tất cả' ? hoSos : hoSos.filter(h => h.tenKhoa === selectedKhoa);
    const dsSauLoc = (dsKhoaLoc || []).filter(hs => {
        const q = searchQuery.toLowerCase();
        return (
            (hs.maSV && String(hs.maSV).toLowerCase().includes(q)) ||
            (hs.hoTen && String(hs.hoTen).toLowerCase().includes(q)) ||
            (hs.hoTenSinhVien && String(hs.hoTenSinhVien).toLowerCase().includes(q)) ||
            (hs.tenLop && String(hs.tenLop).toLowerCase().includes(q)) ||
            (hs.tenKhoa && String(hs.tenKhoa).toLowerCase().includes(q))
        );
    });
    const diemTBKhoa = dsSauLoc.length > 0 ? dsSauLoc.reduce((s, h) => s + h.diemHocTap, 0) / dsSauLoc.length : 0;

    const handleReject = async () => {
        if (!lyDoTuChoi.trim()) return alert("Bắt buộc phải nhập lý do!");
        try {
            const res = await finalDecisionService.tuChoiHoSo(selectedStudentToReject.maHoSo, lyDoTuChoi);
            if (res.success) {
                const newList = [...dsBacBo, { ...selectedStudentToReject, lyDo: lyDoTuChoi }];
                setDsBacBo(newList);
                localStorage.setItem('hdxd_ds_bac_bo', JSON.stringify(newList));
                setHoSos(prev => prev.filter(hs => hs.maHoSo !== selectedStudentToReject.maHoSo));
                setShowModal(false);
                setLyDoTuChoi("");
            }
        } catch (error) { alert(error.message); }
    };

    const handleApproveAll = async () => {
        if (!confirm("Xác nhận chốt danh sách duyệt toàn trường?")) return;
        try {
            const allIds = hoSos.map(hs => hs.maHoSo);
            const res = await finalDecisionService.hoiDongXetChon(allIds);
            if (res.success) {
                alert("Đã chốt danh sách!");
                fetchDots(); // Tải lại đợt vì trạng thái đợt sẽ đổi thành DuKien
            }
        } catch (error) { alert(error.message); }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Xét chọn Sinh viên</h2>
                    <p className="text-gray-500 mt-1">Rà soát và xử lý ngoại lệ vi phạm trước khi chốt danh sách.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-300">
                        <CalendarClock size={16} className="text-gray-400" />
                        <select
                            value={selectedMaDot}
                            onChange={(e) => setSelectedMaDot(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 focus:ring-0"
                        >
                            {dsDotHocBong.map(dot => (
                                <option key={dot.maDot} value={dot.maDot}>
                                    {dot.loaiDot} - HK{dot.hocKy} ({dot.namHoc}) {dot.trangThai !== 'DangXetDuyet' ? '[Lịch sử]' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={selectedKhoa}
                        onChange={(e) => setSelectedKhoa(e.target.value)}
                        className="border-2 border-gray-200 rounded-xl px-4 py-2 font-medium text-gray-700 focus:border-blue-500 outline-none"
                    >
                        {danhSachKhoa.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>

                    <input
                        type="text"
                        placeholder="Tìm theo MSSV, Tên, Lớp, Khoa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
                    />

                    {!isReadOnly() && (
                        <button onClick={handleApproveAll} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                            <ShieldCheck size={20} /> Hoàn tất Duyệt Toàn trường
                        </button>
                    )}
                </div>
            </div>
            <button onClick={() => handleExport(() => exportHoiDongExcel(selectedMaDot))} disabled={exporting}
                style={{ background: '#1D6F42', color: '#fff', padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                📊 Xuất Excel
            </button>
            <button onClick={() => handleExport(() => exportHoiDongPdf(selectedMaDot))} disabled={exporting}
                style={{ background: '#C00', color: '#fff', padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                📄 Xuất PDF
            </button>


            {/* BẢNG DANH SÁCH CHỜ RÀ SOÁT */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 font-bold text-gray-800 text-lg">
                    Danh sách chờ rà soát — Mặc định hợp lệ ({dsSauLoc.length} hồ sơ)
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-5 font-bold text-gray-600 text-sm uppercase">Sinh viên</th>
                            <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center">GPA</th>
                            <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center border-l border-gray-200">ĐRL</th>
                            <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center border-l border-gray-200 bg-blue-50/30">Hệ 10</th>
                            <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center">Xếp loại</th>
                            {!isReadOnly() && <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center">Hành động</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {dsSauLoc.length === 0
                            ? <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Không có hồ sơ nào chờ duyệt.</td></tr>
                            : dsSauLoc.map(hs => {
                                const laBatThuong = hs.diemHocTap < diemTBKhoa - 1.5;
                                return (
                                    <tr key={hs.maHoSo} className={`transition-colors ${laBatThuong ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'hover:bg-blue-50/10'}`}>
                                        <td className="p-5">
                                            <p className="font-bold text-gray-900">{hs.hoTen}</p>
                                            <p className="text-xs text-gray-400">MSSV: {hs.maSV} — Lớp: {hs.tenLop}</p>
                                        </td>
                                        <td className="p-5 text-center font-bold text-gray-700">{Number(hs.gpa).toFixed(2)}</td>
                                        <td className="p-5 text-center font-bold text-gray-700 border-l border-gray-100">{hs.diemRenLuyen || 0}</td>
                                        <td className={`p-5 text-center font-bold text-lg border-l border-gray-100 ${laBatThuong ? 'text-yellow-600' : 'text-blue-600 bg-blue-50/20'}`}>
                                            {Number(hs.diemHocTap).toFixed(2)}
                                            {laBatThuong && <span className="block text-xs font-normal text-yellow-500">⚠️ Thấp hơn TB Khoa</span>}
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{hs.xepLoaiHB}</span>
                                        </td>
                                        {!isReadOnly() && (
                                            <td className="p-5 text-center">
                                                <button onClick={() => { setSelectedStudentToReject(hs); setShowModal(true); }}
                                                    className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 mx-auto">
                                                    <UserX size={16} /> Bác bỏ vi phạm
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {/* BẢNG HỒ SƠ ĐÃ BÁC BỎ */}
            {dsBacBo.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-5 border-b border-red-100 flex gap-2 items-center text-red-700 font-bold text-lg bg-red-50/40">
                        <UserX size={20} /> {isReadOnly() ? "Hồ sơ đã bị từ chối" : "Hồ sơ bị bác bỏ trong phiên"} ({dsBacBo.length})
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-5 font-bold text-gray-600 text-sm uppercase">Sinh viên</th>
                                <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center">GPA</th>
                                <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center border-l border-gray-200">ĐRL</th>
                                <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center border-l border-gray-200">Hệ 10</th>
                                <th className="p-5 font-bold text-gray-600 text-sm uppercase">Lý do bác bỏ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {dsBacBo.map(hs => (
                                <tr key={hs.maHoSo} className="bg-red-50/20">
                                    <td className="p-5"><p className="font-bold text-gray-700">{hs.hoTen}</p><p className="text-xs text-gray-400">MSSV: {hs.maSV}</p></td>
                                    <td className="p-5 text-center font-bold text-gray-600">{Number(hs.gpa).toFixed(2)}</td>
                                    <td className="p-5 text-center font-bold text-gray-600 border-l border-gray-100">{hs.diemRenLuyen}</td>
                                    <td className="p-5 text-center font-bold text-red-500 border-l border-gray-100">{Number(hs.diemHocTap).toFixed(2)}</td>
                                    <td className="p-5 text-sm text-red-600 italic">❌ {hs.lyDo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL BÁC BỎ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center text-red-600 mb-6"><AlertTriangle size={32} /></div>
                        <h3 className="text-2xl font-bold text-gray-900">Bác bỏ hồ sơ</h3>
                        <p className="text-gray-500 mt-2">Đình chỉ học bổng của SV <b className="text-red-600">{selectedStudentToReject?.hoTen}</b>.</p>
                        <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Lý do vi phạm cấp trường (*)</label>
                            <textarea rows="3" className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-red-500 outline-none"
                                placeholder="Ví dụ: Kỷ luật đình chỉ học tập ngày..."
                                value={lyDoTuChoi} onChange={(e) => setLyDoTuChoi(e.target.value)} />
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Hủy</button>
                            <button onClick={handleReject} className="flex-1 py-3 font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">Xác nhận bác bỏ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default XetChonSinhVien;
