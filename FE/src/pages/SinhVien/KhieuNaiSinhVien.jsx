import React, { useState, useEffect, useRef } from 'react';
import KhieuNaiService from '../../services/khieuNaiService';
import api from '../../utils/api';
import {
    FileText,
    Link2,
    UploadCloud,
    AlertCircle,
    CheckCircle2,
    Clock,
    ExternalLink,
    Paperclip,
    Plus,
    X,
    FileWarning,
    Loader2,
    MessageSquare,
    CheckCircle,
    AlertTriangle,
    Trash2
} from 'lucide-react';

const KhieuNaiSinhVien = () => {
    const [danhSach, setDanhSach] = useState([]);
    const [hoSos, setHoSos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [formData, setFormData] = useState({ maHoSo: '', noiDung: '', minhChung: '' });
    const [uploadType, setUploadType] = useState('upload'); // 'upload' hoặc 'link'
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Evidence Preview states
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState('');
    const [previewName, setPreviewName] = useState('');

    useEffect(() => {
        fetchData();
        fetchHoSos();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await KhieuNaiService.layKhieuNaiSinhVien();
            if (res.success) {
                setDanhSach(res.data || []);
            } else {
                setError(res.message || 'Không thể tải dữ liệu.');
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách khiếu nại', err);
            const msg = err.response?.data?.message || err.response?.statusText || err.message || 'Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại Backend.';
            setError(`Lỗi kết nối/truy cập: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchHoSos = async () => {
        try {
            const res = await api.get('/api/sinhvien/tracuu');
            if (res.data && res.data.success) {
                setHoSos(res.data.data || []);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách hồ sơ', err);
        }
    };

    // Tải file trực tiếp lên server
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Giới hạn 5MB phù hợp với cấu hình của Backend
        if (file.size > 5 * 1024 * 1024) {
            alert('Tài liệu minh chứng không được vượt quá 5MB.');
            return;
        }

        setSelectedFile(file);
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const res = await KhieuNaiService.uploadMinhChung(file, (percent) => {
                setUploadProgress(percent);
            });
            if (res.success) {
                setUploadProgress(100);
                setIsUploading(false);
                // Lưu relative URL nhận được từ server vào minhChung
                setFormData((prevForm) => ({ ...prevForm, minhChung: res.data }));
            } else {
                setIsUploading(false);
                alert(res.message || 'Tải file lên server thất bại.');
                xoaFileDaUpload();
            }
        } catch (err) {
            setIsUploading(false);
            console.error('Lỗi khi tải file lên:', err);
            const msg = err.response?.data?.message || err.message || 'Lỗi mạng khi upload file.';
            alert(`Có lỗi xảy ra khi upload tệp tin: ${msg}`);
            xoaFileDaUpload();
        }
    };

    const xoaFileDaUpload = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        setFormData((prevForm) => ({ ...prevForm, minhChung: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGuiKhieuNai = async (e) => {
        e.preventDefault();
        if (!formData.maHoSo) {
            alert('Vui lòng chọn hồ sơ xét học bổng liên quan.');
            return;
        }

        try {
            const res = await KhieuNaiService.guiKhieuNai({
                maHoSo: parseInt(formData.maHoSo),
                noiDung: formData.noiDung,
                minhChung: formData.minhChung || null
            });
            if (res.success) {
                alert('Gửi khiếu nại thành công!');
                setShowModal(false);
                setFormData({ maHoSo: '', noiDung: '', minhChung: '' });
                setSelectedFile(null);
                setUploadProgress(0);
                fetchData();
            } else {
                alert(res.message || 'Gửi khiếu nại thất bại.');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi gửi khiếu nại. Vui lòng thử lại.');
        }
    };

    const handleViewEvidence = (minhChung, maHoSo) => {
        if (!minhChung) return;

        if (minhChung.startsWith('/uploads/')) {
            const fileUrl = `http://localhost:5163${minhChung}`;
            setPreviewUrl(fileUrl);
            setPreviewName(`MinhChung_HS-${maHoSo}`);
            
            const lowerPath = minhChung.toLowerCase();
            if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg') || lowerPath.endsWith('.png')) {
                setPreviewType('image');
            } else if (lowerPath.endsWith('.pdf')) {
                setPreviewType('pdf');
            } else {
                setPreviewType('other');
            }
        } else if (minhChung.startsWith('data:')) {
            setPreviewUrl(minhChung);
            setPreviewName(`MinhChung_HS-${maHoSo}`);
            if (minhChung.includes('image/')) {
                setPreviewType('image');
            } else if (minhChung.includes('pdf')) {
                setPreviewType('pdf');
            } else {
                setPreviewType('other');
            }
        } else {
            // Mở link trực tiếp nếu là link ngoài (Google Drive, OneDrive...)
            window.open(minhChung, '_blank', 'noreferrer');
        }
    };

    // Tính toán thống kê nhanh
    const totalComplaints = danhSach.length;
    const awaitingCount = danhSach.filter((item) => item.trangThai === 'ChoXuLy').length;
    const resolvedCount = danhSach.filter((item) => item.trangThai !== 'ChoXuLy').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Khiếu nại Học bổng</h2>
                    <p className="text-sm text-gray-500 mt-1">Gửi và theo dõi tình trạng giải quyết khiếu nại của bạn</p>
                </div>
                <button
                    onClick={() => {
                        setShowModal(true);
                        // Auto-select the first profile if available
                        if (hoSos.length > 0 && !formData.maHoSo) {
                            setFormData(prev => ({ ...prev, maHoSo: hoSos[0].maHoSo.toString() }));
                        }
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 font-semibold text-sm"
                >
                    <Plus size={16} /> Gửi Khiếu Nại Mới
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-500">Tổng khiếu nại đã gửi</span>
                    <span className="text-2xl font-bold text-gray-900">{totalComplaints}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1.5 border-l-4 border-l-amber-500">
                    <span className="text-sm font-medium text-gray-500">Đang chờ xử lý</span>
                    <span className="text-2xl font-bold text-amber-600">{awaitingCount}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1.5 border-l-4 border-l-green-500">
                    <span className="text-sm font-medium text-gray-500">Đã giải quyết</span>
                    <span className="text-2xl font-bold text-green-600">{resolvedCount}</span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Complaints Table Container */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-medium border-b border-gray-200">
                                <th className="py-3.5 px-6 font-semibold">Mã HS</th>
                                <th className="py-3.5 px-6 font-semibold">Nội dung khiếu nại</th>
                                <th className="py-3.5 px-6 font-semibold">Minh chứng</th>
                                <th className="py-3.5 px-6 font-semibold">Trạng thái</th>
                                <th className="py-3.5 px-6 font-semibold">Phản hồi từ Ban ngành</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                            {loading && (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                            <span>Đang tải danh sách khiếu nại...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && danhSach.length === 0 && !error && (
                                <tr>
                                    <td colSpan="5" className="text-center py-16 text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <MessageSquare size={32} className="text-gray-300" />
                                            <p className="font-semibold text-gray-800">Chưa có khiếu nại nào</p>
                                            <p className="text-xs text-gray-500">Bấm nút "Gửi Khiếu Nại Mới" để tạo yêu cầu chỉnh sửa/khiếu nại.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && danhSach.map((item) => (
                                <tr key={item.maKhieuNai} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">HS-{item.maHoSo}</td>
                                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate" title={item.noiDung}>
                                        {item.noiDung}
                                    </td>
                                    <td className="py-4 px-6">
                                        {item.minhChung ? (
                                            <button
                                                type="button"
                                                onClick={() => handleViewEvidence(item.minhChung, item.maHoSo)}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium focus:outline-none"
                                            >
                                                <Paperclip size={14} className="flex-shrink-0" />
                                                <span>Xem minh chứng</span>
                                                <ExternalLink size={12} className="opacity-70 flex-shrink-0" />
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Không có</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        {item.trangThai === 'ChoXuLy' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                                                <Clock size={12} /> Chờ xử lý
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200/50">
                                                <CheckCircle2 size={12} /> Đã giải quyết
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        {item.noiDungPhanHoi ? (
                                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 max-w-sm">
                                                <p className="text-xs text-gray-700">
                                                    <span className="font-semibold text-blue-700">{item.nguoiPhanHoi || 'Cán bộ'}:</span> {item.noiDungPhanHoi}
                                                </p>
                                                {item.ngayPhanHoi && (
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        {new Date(item.ngayPhanHoi).toLocaleDateString('vi-VN')}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Đang chờ ban ngành phản hồi...</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Gửi Khiếu Nại */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Gửi Khiếu Nại Mới</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Vui lòng điền đầy đủ các thông tin minh chứng cần thiết</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleGuiKhieuNai} className="p-6 space-y-5">
                            {/* Hồ sơ liên quan */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Chọn Hồ sơ Học bổng liên quan <span className="text-red-500">*</span>
                                </label>
                                {hoSos.length === 0 ? (
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                            placeholder="Nhập mã hồ sơ (ví dụ: 1)..."
                                            value={formData.maHoSo}
                                            onChange={(e) => setFormData({ ...formData, maHoSo: e.target.value })}
                                        />
                                        <p className="text-xs text-amber-600 flex items-center gap-1">
                                            <AlertTriangle size={12} />
                                            <span>Không tìm thấy hồ sơ của bạn, vui lòng nhập mã số thủ công.</span>
                                        </p>
                                    </div>
                                ) : (
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                        value={formData.maHoSo}
                                        onChange={(e) => setFormData({ ...formData, maHoSo: e.target.value })}
                                    >
                                        <option value="" disabled>-- Chọn hồ sơ học bổng cần khiếu nại --</option>
                                        {hoSos.map((hs) => (
                                            <option key={hs.maHoSo} value={hs.maHoSo}>
                                                HS-{hs.maHoSo} - GPA: {hs.gpa} ({hs.xepLoaiHB || 'Chưa xét'})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Nội dung khiếu nại */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Nội dung khiếu nại/kiến nghị <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all resize-none"
                                    placeholder="Vui lòng nêu chi tiết vấn đề (ví dụ: điểm GPA hiển thị sai, xếp loại chưa đúng so với tiêu chí...)"
                                    value={formData.noiDung}
                                    onChange={(e) => setFormData({ ...formData, noiDung: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Đính kèm minh chứng */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Tệp tin hoặc Liên kết minh chứng
                                    </label>
                                    {/* Upload Type Switcher */}
                                    <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadType('upload');
                                                xoaFileDaUpload();
                                            }}
                                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${uploadType === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            Tải tệp lên
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadType('link');
                                                xoaFileDaUpload();
                                            }}
                                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${uploadType === 'link' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            Dán link
                                        </button>
                                    </div>
                                </div>

                                {uploadType === 'upload' ? (
                                    <div className="space-y-3">
                                        {/* Dropzone hoặc Tình trạng Upload */}
                                        {!selectedFile ? (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                                            >
                                                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Nhấp để tải tài liệu lên</p>
                                                    <p className="text-xs text-gray-400 mt-1">Hỗ trợ PDF, PNG, JPG (Tối đa 2.5MB)</p>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        ) : (
                                            <div className="border border-gray-200 bg-gray-50 p-4 rounded-xl space-y-3">
                                                {/* File Info */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-sm font-semibold text-gray-800 truncate" title={selectedFile.name}>
                                                                {selectedFile.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!isUploading && (
                                                        <button
                                                            type="button"
                                                            onClick={xoaFileDaUpload}
                                                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Progress Bar hoặc Complete State */}
                                                {isUploading ? (
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                                                            <span>Đang đọc tệp tin...</span>
                                                            <span>{uploadProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 border border-green-200/50 px-2.5 py-1 rounded-md w-fit">
                                                        <CheckCircle size={12} />
                                                        <span>Đính kèm tệp tin thành công!</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                                            <Link2 size={16} />
                                        </span>
                                        <input
                                            type="url"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                            placeholder="https://drive.google.com/..."
                                            value={formData.minhChung}
                                            onChange={(e) => setFormData({ ...formData, minhChung: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer Action Buttons */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-150">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg text-sm transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Gửi đi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Xem Minh Chứng (Hỗ trợ Base64) */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Paperclip size={18} className="text-blue-600" />
                                    <span>Tài liệu Minh chứng đính kèm</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">{previewName}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setPreviewType('');
                                }}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-gray-100 flex flex-col items-center justify-center min-h-[40vh] max-h-[70vh] overflow-y-auto">
                            {previewType === 'image' ? (
                                <img
                                    src={previewUrl}
                                    alt="Minh chứng"
                                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-gray-200"
                                />
                            ) : previewType === 'pdf' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center py-8 space-y-4">
                                    <FileText size={64} className="text-red-500 animate-bounce" />
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-800 text-base">Tài liệu Minh chứng PDF</p>
                                        <p className="text-xs text-gray-500 mt-1">Trình duyệt đã sẵn sàng tải xuống hoặc xem trực tiếp.</p>
                                    </div>
                                    <a
                                        href={previewUrl}
                                        download={`${previewName}.pdf`}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow flex items-center gap-2 transition-all"
                                    >
                                        <ExternalLink size={16} /> Tải xuống & Xem tệp PDF
                                    </a>
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-[45vh] rounded-lg border border-gray-200 mt-4 shadow-sm"
                                        title="PDF Preview"
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="text-center py-12 space-y-4">
                                    <FileText size={64} className="text-blue-500 mx-auto" />
                                    <div>
                                        <p className="font-semibold text-gray-800 text-base">Định dạng tài liệu tải lên</p>
                                        <p className="text-xs text-gray-500 mt-1">Tài liệu đính kèm dạng tệp nhị phân Base64.</p>
                                    </div>
                                    <a
                                        href={previewUrl}
                                        download={previewName}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow inline-flex items-center gap-2 transition-all"
                                    >
                                        <ExternalLink size={16} /> Tải xuống Tài liệu đính kèm
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setPreviewType('');
                                }}
                                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KhieuNaiSinhVien;