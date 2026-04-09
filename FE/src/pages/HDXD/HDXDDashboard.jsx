import React, { useState } from 'react';
import { ShieldCheck, Eye, UserX, CheckCircle, AlertTriangle } from 'lucide-react';

const HDXDDashboard = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Hội đồng Xét duyệt</h2>
                    <p className="text-gray-500 mt-1">Thẩm định danh sách và phê duyệt kết quả cuối cùng.</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                    <CheckCircle size={20} /> Chốt danh sách xét duyệt
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="p-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Sinh viên</th>
                            <th className="p-6 font-bold text-gray-700 text-sm uppercase tracking-wider text-center">GPA / ĐRL</th>
                            <th className="p-6 font-bold text-gray-700 text-sm uppercase tracking-wider text-center">Loại HB</th>
                            <th className="p-6 font-bold text-gray-700 text-sm uppercase tracking-wider text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[1, 2, 3].map((item) => (
                            <tr key={item} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold">SV</div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-base">Huỳnh Minh Dũng</p>
                                            <p className="text-xs text-gray-500 font-medium">MSSV: 23115053122108</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-center">
                                    <span className="font-bold text-gray-800">3.6</span> <span className="text-gray-400">/</span> <span className="font-bold text-gray-800">85</span>
                                </td>
                                <td className="p-6 text-center">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Loại Xuất sắc</span>
                                </td>
                                <td className="p-6">
                                    <div className="flex justify-center gap-3">
                                        <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye size={18} /></button>
                                        <button onClick={() => setShowModal(true)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><UserX size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal xử lý khi loại sinh viên theo Usecase */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-up">
                        <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Loại bỏ sinh viên?</h3>
                        <p className="text-gray-500 mt-2">Vui lòng nhập lý do loại bỏ sinh viên này khỏi danh sách nhận học bổng.</p>
                        <textarea className="w-full mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-red-500 text-sm" rows="3" placeholder="Lý do vi phạm..."></textarea>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Hủy</button>
                            <button className="flex-1 py-3 font-bold bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-all">Xác nhận loại</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HDXDDashboard;