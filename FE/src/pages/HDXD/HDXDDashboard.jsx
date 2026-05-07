import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import finalDecisionService from '../../services/finalDecisionService';

import { CalendarClock } from 'lucide-react';

const HDXDDashboard = () => {
    const [hoSos, setHoSos] = useState([]);
    const [dsDotHocBong, setDsDotHocBong] = useState([]);
    const [selectedMaDot, setSelectedMaDot] = useState('');

    const fetchDots = async () => {
        try {
            const res = await finalDecisionService.layDsDotHocBong();
            if (res.success) {
                // Hội đồng thấy các đợt từ DangXetDuyet trở đi
                const dots = res.data.filter(d => d.trangThai !== 'KhoiTao' && d.trangThai !== 'DaCoDiem');
                setDsDotHocBong(dots);
                if (dots.length > 0) {
                    const activeDot = dots.find(d => d.trangThai === 'DangXetDuyet') || dots[0];
                    setSelectedMaDot(activeDot.maDot);
                }
            }
        } catch (error) { console.error(error); }
    };

    const fetchHoSo = async (maDot) => {
        if (!maDot) return;
        try {
            const res = await finalDecisionService.getTongHopToanTruong(maDot);
            if (res.success) {
                const dsHopLe = res.data.filter(hs => hs.trangThai !== 'TuChoi');
                setHoSos(dsHopLe);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => { fetchDots(); }, []);
    useEffect(() => { fetchHoSo(selectedMaDot); }, [selectedMaDot]);

    // TÍNH TOÁN DỮ LIỆU CHO BIỂU ĐỒ & THỐNG KÊ
    const tongSinhVien = hoSos.length;
    const countXuatSac = hoSos.filter(h => h.xepLoaiHB === 'Xuất sắc').length;
    const countGioi = hoSos.filter(h => h.xepLoaiHB === 'Giỏi').length;
    const countKha = hoSos.filter(h => h.xepLoaiHB === 'Khá').length;

    const chartData = [
        { name: 'Xuất sắc', 'Số lượng': countXuatSac, color: '#3b82f6' },
        { name: 'Giỏi', 'Số lượng': countGioi, color: '#10b981' },
        { name: 'Khá', 'Số lượng': countKha, color: '#f59e0b' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Dashboard Hội đồng</h2>
                    <p className="text-gray-500 mt-1">Rà soát danh sách tổng và xem biểu đồ phân bổ.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
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
            </div>

            {/* KHU VỰC THỐNG KÊ DÀNH CHO SẾP */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-gray-500 font-bold mb-2">TỔNG SINH VIÊN ĐỀ XUẤT</h3>
                    <p className="text-5xl font-extrabold text-gray-900">{tongSinhVien} <span className="text-lg text-gray-400 font-normal">hồ sơ</span></p>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 font-bold mb-4">PHÂN BỔ THEO XẾP LOẠI</h3>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontWeight="bold" />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="Số lượng" radius={[0, 8, 8, 0]} barSize={20}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {/* BẢNG TỔNG HỢP THEO KHOA */}
            {(() => {
                // Group hồ sơ theo Khoa
                const theoKhoa = hoSos.reduce((acc, hs) => {
                    const key = hs.tenKhoa || 'Chưa xác định';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(hs);
                    return acc;
                }, {});

                const rows = Object.entries(theoKhoa).map(([tenKhoa, ds]) => ({
                    tenKhoa,
                    soLuong: ds.length,
                    diemMin: Math.min(...ds.map(h => h.diemHocTap)).toFixed(2),
                    diemMax: Math.max(...ds.map(h => h.diemHocTap)).toFixed(2),
                    diemTB: (ds.reduce((s, h) => s + h.diemHocTap, 0) / ds.length).toFixed(2),
                }));

                return rows.length > 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 font-bold text-gray-800 text-lg flex items-center gap-2">
                            📊 Tổng hợp đề xuất theo Khoa
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-5 font-bold text-gray-600 text-sm uppercase">Khoa</th>
                                    <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center">Số SV đề xuất</th>
                                    <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center">Điểm thấp nhất</th>
                                    <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center bg-blue-50/30">Điểm TB</th>
                                    <th className="p-5 font-bold text-gray-600 text-sm uppercase text-center">Điểm cao nhất</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rows.map(r => (
                                    <tr key={r.tenKhoa} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-5 font-bold text-gray-800">{r.tenKhoa}</td>
                                        <td className="p-5 text-center">
                                            <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">{r.soLuong} SV</span>
                                        </td>
                                        <td className="p-5 text-center font-bold text-orange-500">{r.diemMin}</td>
                                        <td className="p-5 text-center font-bold text-blue-600 bg-blue-50/20">{r.diemTB}</td>
                                        <td className="p-5 text-center font-bold text-green-600">{r.diemMax}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null;
            })()}

        </div>

    );
};

export default HDXDDashboard;
