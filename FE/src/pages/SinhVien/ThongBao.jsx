import React, { useState, useEffect } from 'react';
import { 
    Bell, Mail, MailOpen, Award, Trophy, CheckCircle2, 
    XCircle, Clock, Calendar, DollarSign, BookOpen, 
    Activity, AlertCircle, Sparkles, ChevronRight, GraduationCap
} from 'lucide-react';
import api from '../../utils/api';

const ThongBao = () => {
    const [hoSos, setHoSos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    
    // Lưu các thông báo đã đọc vào localStorage
    const [readIds, setReadIds] = useState(() => {
        try {
            const saved = localStorage.getItem('read_notifications');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        fetchMyProfiles();
    }, []);

    const fetchMyProfiles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/sinhvien/tracuu');
            if (response.data.success) {
                const data = response.data.data || [];
                setHoSos(data);
                if (data.length > 0) {
                    setSelectedId(data[0].maHoSo);
                    // Đánh dấu đã đọc cho thông báo đầu tiên
                    markAsRead(data[0].maHoSo);
                }
            } else {
                setError(response.data.message || "Không thể tải dữ liệu.");
            }
        } catch (err) {
            console.error("Lỗi fetch profiles:", err);
            setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = (maHoSo) => {
        if (!readIds.includes(maHoSo)) {
            const newReadIds = [...readIds, maHoSo];
            setReadIds(newReadIds);
            localStorage.setItem('read_notifications', JSON.stringify(newReadIds));
        }
    };

    const handleSelectNotification = (maHoSo) => {
        setSelectedId(maHoSo);
        markAsRead(maHoSo);
    };

    // Hàm chuyển đổi nhãn xếp loại học bổng
    const getXepLoaiLabel = (xepLoai) => {
        switch (xepLoai) {
            case 'XuatSac': return 'Xuất Sắc';
            case 'Gioi': return 'Giỏi';
            case 'Kha': return 'Khá';
            default: return xepLoai || 'Chưa xếp loại';
        }
    };

    // Hàm trả về màu sắc của trạng thái chính
    const getStatusStyle = (status) => {
        switch (status) {
            case 'ChoXet':
                return { text: 'Chờ xét duyệt', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-200' };
            case 'KhoaDeXuat':
                return { text: 'Khoa đề xuất', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
            case 'Loai':
                return { text: 'Bị loại từ cấp Khoa', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
            case 'HoiDongDuyet':
            case 'DuKien':
            case 'CongBoLayYKien':
            case 'LayYKienHoanTat':
                return { text: 'Hội đồng thông qua (Dự kiến)', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
            case 'ChoPheDuyet':
                return { text: 'Chờ BGH phê duyệt', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' };
            case 'ChinhThuc':
                return { text: 'Chính thức nhận học bổng', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
            case 'TuChoi':
                return { text: 'Từ chối cấp học bổng', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
            default:
                return { text: status || 'Không xác định', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
        }
    };

    // Hàm tạo các bước Stepper cho tiến trình
    const getStepperSteps = (status, ghiChu) => {
        const steps = [
            {
                title: 'Nộp hồ sơ',
                desc: 'Hồ sơ đã gửi thành công lên hệ thống',
                status: 'completed' // Bước 1 luôn luôn hoàn thành
            },
            {
                title: 'Khoa xét duyệt',
                desc: 'Ban chủ nhiệm Khoa thẩm định điểm học vụ và rèn luyện',
                status: 'pending'
            },
            {
                title: 'Hội đồng xét duyệt',
                desc: 'Hội đồng Trường tổng hợp và lập danh sách dự kiến',
                status: 'pending'
            },
            {
                title: 'Quyết định chính thức',
                desc: 'Ban Giám Hiệu phê duyệt danh sách và mức học bổng chính thức',
                status: 'pending'
            }
        ];

        // Bước 2: Khoa xét duyệt
        if (status === 'ChoXet') {
            steps[1].status = 'active';
            steps[1].desc = 'Khoa đang tiến hành xét chọn ứng viên...';
        } else if (status === 'Loai') {
            steps[1].status = 'failed';
            steps[1].desc = 'Hồ sơ không đủ điều kiện xét chọn hoặc vượt quá chỉ tiêu phân bổ.';
        } else {
            steps[1].status = 'completed';
            steps[1].desc = 'Khoa đã phê duyệt đề xuất lên cấp Trường';
        }

        // Bước 3: Hội đồng xét chọn
        if (steps[1].status === 'completed') {
            if (status === 'KhoaDeXuat') {
                steps[2].status = 'active';
                steps[2].desc = 'Hội đồng xét duyệt đang rà soát chỉ tiêu toàn trường...';
            } else {
                steps[2].status = 'completed';
                steps[2].desc = 'Hội đồng đã phê duyệt thông qua';
            }
        }

        // Bước 4: Ban Giám Hiệu phê duyệt chính thức
        if (steps[2].status === 'completed') {
            if (status === 'ChinhThuc') {
                steps[3].status = 'completed';
                steps[3].desc = 'Ban Giám Hiệu đã ký quyết định cấp học bổng';
            } else if (status === 'TuChoi') {
                steps[3].status = 'failed';
                steps[3].desc = ghiChu ? `Từ chối phê duyệt. Lý do: ${ghiChu}` : 'Từ chối phê duyệt chính thức';
            } else {
                steps[3].status = 'active';
                steps[3].desc = 'Đã lập tờ trình, đang đợi Ban Giám Hiệu ký duyệt chính thức...';
            }
        }

        return steps;
    };

    const selectedProfile = hoSos.find(h => h.maHoSo === selectedId);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Trang */}
            <div className="flex items-center gap-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    <Bell className="w-6 h-6 animate-swing" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Thông báo & Tiến trình hồ sơ</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Theo dõi kết quả thẩm định và tiến trình xét duyệt học bổng khuyến khích học tập của bạn.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-500">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-medium">Đang tải dữ liệu hồ sơ...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Lỗi kết xuất dữ liệu</h4>
                        <p className="text-sm mt-0.5">{error}</p>
                    </div>
                </div>
            ) : hoSos.length === 0 ? (
                <div className="bg-white p-16 rounded-xl border border-gray-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                        <GraduationCap className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Không tìm thấy hồ sơ</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                        Bạn chưa nộp hồ sơ xét học bổng nào trong cơ sở dữ liệu hiện tại, hoặc các đợt xét tuyển chưa được đồng bộ điểm học vụ.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* DANH SÁCH THÔNG BÁO (BÊN TRÁI) */}
                    <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Hộp thư thông báo ({hoSos.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
                            {hoSos.map((item) => {
                                const isSelected = item.maHoSo === selectedId;
                                const isRead = readIds.includes(item.maHoSo);
                                const statusStyle = getStatusStyle(item.trangThai);
                                
                                return (
                                    <div
                                        key={item.maHoSo}
                                        onClick={() => handleSelectNotification(item.maHoSo)}
                                        className={`p-4 cursor-pointer transition-all duration-200 flex gap-3 items-start relative ${
                                            isSelected 
                                                ? 'bg-blue-50/70 border-l-4 border-blue-600' 
                                                : 'hover:bg-gray-50/50'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                                            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {isRead ? <MailOpen size={16} /> : <Mail size={16} className="text-blue-600 animate-pulse" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[11px] font-semibold text-gray-400">HS-{item.maHoSo}</span>
                                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {item.ngayNop ? new Date(item.ngayNop).toLocaleDateString('vi-VN') : 'Vừa xong'}
                                                </span>
                                            </div>
                                            <h4 className={`text-xs font-bold text-gray-900 leading-snug truncate ${!isRead ? 'font-black' : ''}`}>
                                                Cập nhật tiến trình: {item.loaiDot || 'Học bổng khuyến học'}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 mt-1 truncate">
                                                Học kỳ {item.hocKy} - Năm học {item.namHoc}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusStyle.color} ${statusStyle.bg}`}>
                                                    {statusStyle.text}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Chấm đỏ báo chưa đọc */}
                                        {!isRead && (
                                            <span className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full"></span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CHI TIẾT THÔNG BÁO & TIẾN TRÌNH (BÊN PHẢI) */}
                    <div className="lg:col-span-8 space-y-6">
                        {selectedProfile ? (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                
                                {/* Header chi tiết */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                                Hồ sơ: HS-{selectedProfile.maHoSo}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={13} />
                                                Nộp ngày: {selectedProfile.ngayNop ? new Date(selectedProfile.ngayNop).toLocaleDateString('vi-VN') : '--'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mt-2">
                                            {selectedProfile.loaiDot || 'Học bổng Khuyến khích học tập'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Học kỳ {selectedProfile.hocKy} &bull; Năm học {selectedProfile.namHoc}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusStyle(selectedProfile.trangThai).bg} ${getStatusStyle(selectedProfile.trangThai).color}`}>
                                            {getStatusStyle(selectedProfile.trangThai).text}
                                        </span>
                                    </div>
                                </div>

                                {/* Banner Chúc mừng hoặc Từ chối */}
                                {selectedProfile.trangThai === 'ChinhThuc' && (
                                    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/70 via-yellow-50/40 to-amber-50/70 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-5 items-center">
                                        {/* Sparkle background decoration */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-300/10 to-transparent rounded-full blur-xl pointer-events-none"></div>
                                        
                                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-full flex items-center justify-center shadow-md flex-shrink-0 animate-bounce">
                                            <Trophy className="w-7 h-7" />
                                        </div>
                                        
                                        <div className="flex-1 text-center md:text-left space-y-2">
                                            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-700 font-bold text-base uppercase tracking-wider">
                                                <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                                                Chúc mừng sinh viên nhận học bổng!
                                                <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                Chúc mừng sinh viên <span className="font-bold text-gray-900">{selectedProfile.hoTen}</span> đã xuất sắc đạt Học bổng Khuyến khích học tập xếp loại <span className="font-bold text-amber-600">{getXepLoaiLabel(selectedProfile.xepLoaiHB)}</span>. Nhà trường ghi nhận tinh thần nỗ lực vươn lên trong học tập và rèn luyện của em.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center md:justify-start">
                                                <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
                                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                                    <span className="text-xs text-gray-500">Mức học bổng:</span>
                                                    <span className="font-bold text-sm text-emerald-600">
                                                        {selectedProfile.mucHocBong != null 
                                                            ? Number(selectedProfile.mucHocBong).toLocaleString('vi-VN') + ' VNĐ' 
                                                            : 'Đang cập nhật'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedProfile.trangThai === 'TuChoi' && (
                                    <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 flex gap-4 items-start">
                                        <div className="p-2.5 bg-red-100 text-red-600 rounded-lg flex-shrink-0">
                                            <XCircle className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-red-800 text-sm">Hồ sơ bị từ chối phê duyệt chính thức</h4>
                                            <p className="text-xs text-red-700 leading-relaxed">
                                                {selectedProfile.ghiChu 
                                                    ? `Lý do từ chối: "${selectedProfile.ghiChu}"` 
                                                    : 'Rất tiếc, hồ sơ của bạn đã bị từ chối phê duyệt ở bước quyết định cuối cùng.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Bảng điểm học vụ tóm tắt */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <GraduationCap size={16} className="text-blue-600" />
                                        Kết quả học tập & rèn luyện
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                                            <div className="p-2.5 bg-white text-blue-600 rounded-lg border border-gray-100 shadow-sm">
                                                <BookOpen size={16} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-500 block font-medium">GPA Học kỳ</span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {selectedProfile.gpa != null ? Number(selectedProfile.gpa).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                                            <div className="p-2.5 bg-white text-emerald-600 rounded-lg border border-gray-100 shadow-sm">
                                                <Activity size={16} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-500 block font-medium">Điểm học tập (Thang 10)</span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {selectedProfile.diemHocTap != null ? Number(selectedProfile.diemHocTap).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                                            <div className="p-2.5 bg-white text-purple-600 rounded-lg border border-gray-100 shadow-sm">
                                                <Award size={16} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-500 block font-medium">Điểm rèn luyện</span>
                                                <span className="text-sm font-bold text-gray-900">{selectedProfile.diemRenLuyen ?? '--'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TIẾN TRÌNH CHI TIẾT (STEPPER) */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <Clock size={16} className="text-blue-600" />
                                        Tiến trình phê duyệt chi tiết
                                    </h4>
                                    
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                        {getStepperSteps(selectedProfile.trangThai, selectedProfile.ghiChu).map((step, idx) => {
                                            let iconEl;
                                            let colorClass = 'border-gray-300 text-gray-400 bg-white';
                                            let titleClass = 'text-gray-500';

                                            if (step.status === 'completed') {
                                                iconEl = <CheckCircle2 className="w-5 h-5 fill-green-600 text-white" />;
                                                colorClass = 'border-green-600';
                                                titleClass = 'text-green-700 font-bold';
                                            } else if (step.status === 'active') {
                                                iconEl = <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></div>;
                                                colorClass = 'border-blue-600 bg-blue-50 ring-4 ring-blue-50';
                                                titleClass = 'text-blue-700 font-bold';
                                            } else if (step.status === 'failed') {
                                                iconEl = <XCircle className="w-5 h-5 text-red-600 bg-white" />;
                                                colorClass = 'border-red-600';
                                                titleClass = 'text-red-700 font-bold';
                                            } else {
                                                iconEl = <div className="w-2 h-2 bg-gray-300 rounded-full"></div>;
                                                colorClass = 'border-gray-200 bg-gray-50';
                                                titleClass = 'text-gray-400';
                                            }

                                            return (
                                                <div key={idx} className="relative flex gap-4 items-start group">
                                                    <div className={`absolute left-[-20px] w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${colorClass}`}>
                                                        {iconEl}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h5 className={`text-xs uppercase tracking-wide ${titleClass}`}>
                                                            {step.title}
                                                        </h5>
                                                        <p className="text-xs text-gray-500 leading-relaxed">
                                                            {step.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
                                Chọn một thông báo để xem thông tin chi tiết.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThongBao;
