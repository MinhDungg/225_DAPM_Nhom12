import React, { useState } from 'react';
import {
    Users, FileWarning, Send, CheckSquare, BarChart3,
    X, CheckCircle, AlertTriangle, FileText, Loader2, Megaphone, FileCheck
} from 'lucide-react';

const CTSVDashboard = () => {
    // Quản lý trạng thái của các Modal chức năng
    const [activeModal, setActiveModal] = useState(null); // 'phan-bo' | 'cong-bo' | 'trinh-duyet' | 'khieu-nai'
    const [loadingStep, setLoadingStep] = useState('idle'); // 'idle' | 'loading' | 'success'

    // Xử lý khi bấm xác nhận trong Modal
    const executeAction = () => {
        setLoadingStep('loading');
        // Giả lập thời gian server xử lý mất 1.5 giây
        setTimeout(() => {
            setLoadingStep('success');
        }, 1500);
    };

    // Đóng Modal và reset trạng thái
    const closeModal = () => {
        setActiveModal(null);
        setLoadingStep('idle');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Phòng Công tác Sinh viên</h2>
                    <p className="text-slate-500 mt-1">Điều phối và quản lý toàn trình quy trình xét duyệt Học bổng.</p>
                </div>
            </div>

            {/* 1. KHU VỰC THỐNG KÊ (Dữ liệu tổng quan) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><Users size={24} /></div>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Bình thường</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tổng sinh viên đủ ĐK</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1">1,245</h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Dữ liệu từ P.Đào Tạo</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><CheckSquare size={24} /></div>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Tiến độ tốt</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Khoa đã nộp đề xuất</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1">10 / 14</h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">4 khoa đang chậm</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-red-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-red-50 text-red-600 p-3 rounded-2xl animate-pulse"><FileWarning size={24} /></div>
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Cấp bách</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Khiếu nại chờ xử lý</p>
                    <h3 className="text-3xl font-black text-red-600 mt-1">12</h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Cần xử lý trước 25/03</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl"><BarChart3 size={24} /></div>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Bình thường</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Kinh phí đã phân bổ</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1">2.1 Tỷ</h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">85% tổng ngân sách</p>
                </div>
            </div>

            {/* 2. KHU VỰC THAO TÁC NGHIỆP VỤ (Các nút chức năng thực thụ) */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">Các thao tác nghiệp vụ nhanh</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <button onClick={() => setActiveModal('phan-bo')} className="flex flex-col items-center justify-center p-8 border border-slate-200 rounded-3xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group active:scale-95 text-center">
                        <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><Send size={28} /></div>
                        <span className="font-bold text-slate-800 group-hover:text-blue-700">Phân bổ dữ liệu về Khoa</span>
                        <span className="text-xs text-slate-500 mt-2 font-medium">Chuyển DS đủ ĐK cho các Khoa</span>
                    </button>

                    <button onClick={() => setActiveModal('cong-bo')} className="flex flex-col items-center justify-center p-8 border border-slate-200 rounded-3xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group active:scale-95 text-center">
                        <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><Megaphone size={28} /></div>
                        <span className="font-bold text-slate-800 group-hover:text-blue-700">Công bố DS Dự kiến</span>
                        <span className="text-xs text-slate-500 mt-2 font-medium">Công khai danh sách cho SV</span>
                    </button>

                    <button onClick={() => setActiveModal('khieu-nai')} className="flex flex-col items-center justify-center p-8 border border-slate-200 rounded-3xl hover:border-red-200 hover:bg-red-50/50 transition-all group active:scale-95 text-center relative">
                        <div className="absolute top-4 right-4 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">12</div>
                        <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><FileWarning size={28} /></div>
                        <span className="font-bold text-slate-800 group-hover:text-red-700">Xử lý Khiếu nại</span>
                        <span className="text-xs text-slate-500 mt-2 font-medium">Kiểm tra và phản hồi sinh viên</span>
                    </button>

                    <button onClick={() => setActiveModal('trinh-duyet')} className="flex flex-col items-center justify-center p-8 border border-slate-200 rounded-3xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group active:scale-95 text-center">
                        <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><FileCheck size={28} /></div>
                        <span className="font-bold text-slate-800 group-hover:text-emerald-700">Trình duyệt danh sách</span>
                        <span className="text-xs text-slate-500 mt-2 font-medium">Lập tờ trình gửi Hiệu trưởng</span>
                    </button>

                </div>
            </div>

            {/* ================= MODALS NGHIỆP VỤ ================= */}
            {activeModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">

                        {/* Header Modal */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {activeModal === 'phan-bo' && <><Send className="text-blue-600" /> Phân bổ dữ liệu về Khoa</>}
                                {activeModal === 'cong-bo' && <><Megaphone className="text-blue-600" /> Công bố Danh sách Dự kiến</>}
                                {activeModal === 'khieu-nai' && <><FileWarning className="text-red-600" /> Xử lý Khiếu nại Sinh viên</>}
                                {activeModal === 'trinh-duyet' && <><FileCheck className="text-emerald-600" /> Lập Tờ trình BGH</>}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-8">
                            {loadingStep === 'idle' && (
                                <div className="space-y-6">
                                    {/* Nội dung riêng của từng Modal */}
                                    {activeModal === 'phan-bo' && (
                                        <p className="text-slate-600">Hệ thống sẽ chuyển <strong>1,245</strong> hồ sơ sinh viên đủ điều kiện từ Phòng Đào tạo về <strong>14 Khoa</strong> tương ứng để các Khoa lập danh sách đề xuất. Bạn có chắc chắn muốn thực hiện?</p>
                                    )}
                                    {activeModal === 'cong-bo' && (
                                        <div className="space-y-4">
                                            <p className="text-slate-600">Chọn danh sách bạn muốn công bố lên Cổng thông tin Sinh viên:</p>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>Danh sách Dự kiến HB KKHT - Học kỳ 1 (2025-2026)</option>
                                                <option>Danh sách Dự kiến HB Doanh nghiệp VNPT</option>
                                            </select>
                                        </div>
                                    )}
                                    {activeModal === 'trinh-duyet' && (
                                        <div className="space-y-4">
                                            <p className="text-slate-600">Hệ thống sẽ tổng hợp danh sách cuối cùng và tạo Tờ trình số <strong>125/TTr-CTSV</strong> gửi lên Ban Giám Hiệu phê duyệt.</p>
                                            <input type="text" placeholder="Nhập ghi chú cho BGH (nếu có)..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                    )}
                                    {activeModal === 'khieu-nai' && (
                                        <div className="space-y-3">
                                            <div className="p-4 border border-red-100 bg-red-50 rounded-2xl flex gap-4 items-start">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 font-bold shrink-0">SV</div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">Huỳnh Minh Dũng (231150531...)</p>
                                                    <p className="text-xs text-slate-600 mt-1">"Dạ thưa thầy cô, điểm rèn luyện của em trên hệ thống web học bổng đang là 65, nhưng trên trang SV là 85 ạ."</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-center text-slate-400 font-medium italic mt-4">+ 11 khiếu nại khác đang chờ...</p>
                                        </div>
                                    )}

                                    {/* Nút Execute chung */}
                                    <button
                                        onClick={executeAction}
                                        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
                      ${activeModal === 'khieu-nai' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                                                activeModal === 'trinh-duyet' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                                                    'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                                    >
                                        {activeModal === 'phan-bo' && 'Xác nhận phân bổ dữ liệu'}
                                        {activeModal === 'cong-bo' && 'Phát hành thông báo'}
                                        {activeModal === 'trinh-duyet' && 'Trình lên Hiệu trưởng'}
                                        {activeModal === 'khieu-nai' && 'Mở phân hệ xử lý chi tiết'}
                                    </button>
                                </div>
                            )}

                            {/* Trạng thái Loading */}
                            {loadingStep === 'loading' && (
                                <div className="py-12 flex flex-col items-center justify-center text-blue-600 space-y-4">
                                    <Loader2 size={48} className="animate-spin" />
                                    <p className="font-bold text-slate-600 animate-pulse">Hệ thống đang xử lý dữ liệu...</p>
                                </div>
                            )}

                            {/* Trạng thái Success */}
                            {loadingStep === 'success' && (
                                <div className="py-8 flex flex-col items-center justify-center text-emerald-600 space-y-4 animate-in zoom-in">
                                    <div className="bg-emerald-100 p-4 rounded-full mb-2">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-800">Thành công!</h4>
                                    <p className="text-slate-500 text-center text-sm px-4">
                                        Thao tác nghiệp vụ đã được hệ thống ghi nhận và thực thi hoàn tất.
                                    </p>
                                    <button onClick={closeModal} className="mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl transition-colors">
                                        Đóng cửa sổ
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CTSVDashboard;