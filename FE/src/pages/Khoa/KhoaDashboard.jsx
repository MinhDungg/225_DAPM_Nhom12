import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Send,
  Award,
  Calculator,
  RefreshCw,
  AlertCircle,
  Loader,
} from "lucide-react";
import khoaService from "../../services/khoaService";

const KhoaDashboard = () => {
  // ============ STATE MANAGEMENT ============
  const [currentStep, setCurrentStep] = useState(1); // 1: Xem DS, 2: Xếp hạng, 3: Chốt
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hoSoChoDuyet, setHoSoChoDuyet] = useState([]);
  const [ketQuaXepHang, setKetQuaXepHang] = useState(null);
  const [maDot, setMaDot] = useState(2);
  const [nganSach, setNganSach] = useState(50000000);
  const [danhSachChon, setDanhSachChon] = useState([]);
  const [hoSoDaDeXuat, setHoSoDaDeXuat] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ============ EFFECTS ============
  useEffect(() => {
    layDanhSachChoDuyet();
    layDanhSachDaDeXuat();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (currentStep === 3) setCurrentStep(2);
      else if (currentStep === 2) setCurrentStep(1);
    };

    if (currentStep > 1) {
      window.history.pushState({ step: currentStep }, "");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentStep]);

  // ============ API CALLS ============
  const layDanhSachChoDuyet = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await khoaService.layDanhSachChoDuyet();
      if (response.success) setHoSoChoDuyet(response.data);
    } catch (err) {
      setError("Không thể tải danh sách hồ sơ. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const layDanhSachDaDeXuat = async () => {
    try {
      const response = await khoaService.layDanhSachDaDeXuat();
      if (response.success) setHoSoDaDeXuat(response.data);
    } catch (err) {
      console.error("Không thể tải danh sách đã đề xuất:", err);
    }
  };

  const handleXepHang = async () => {
    if (nganSach <= 0) {
      alert("Vui lòng nhập ngân sách hợp lệ!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await khoaService.xepHangVaPhanBo(maDot, nganSach);
      if (response.success) {
        setKetQuaXepHang(response.data);
        setCurrentStep(2);
        const dsChon = response.data.danhSachXepHang
          .filter(
            (sv) =>
              sv.xepLoai !== "KhongDuDieuKien" &&
              sv.mucHocBong > 0 &&
              sv.duocNhan,
          )
          .map((sv) => sv.maHoSo);
        setDanhSachChon(dsChon);
      }
    } catch (err) {
      setError("Không thể xếp hạng. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChotDanhSach = async () => {
    if (danhSachChon.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sinh viên!");
      return;
    }
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn chốt danh sách ${danhSachChon.length} sinh viên?`,
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await khoaService.chotDanhSachDeXuat(
        maDot,
        danhSachChon,
      );
      if (response.success) {
        alert(`Đã chốt thành công ${response.data.soLuongDaChot} hồ sơ!`);
        setCurrentStep(3);
        layDanhSachChoDuyet();
        layDanhSachDaDeXuat();
      }
    } catch (err) {
      setError("Không thể chốt danh sách. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============ HELPERS ============
  const toggleChon = (maHoSo) => {
    setDanhSachChon((prev) =>
      prev.includes(maHoSo)
        ? prev.filter((id) => id !== maHoSo)
        : [...prev, maHoSo],
    );
  };

  const getXepLoaiColor = (xepLoai) => {
    switch (xepLoai) {
      case "XuatSac":
        return "bg-purple-100 text-purple-700";
      case "Gioi":
        return "bg-blue-100 text-blue-700";
      case "Kha":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getXepLoaiText = (xepLoai) => {
    switch (xepLoai) {
      case "XuatSac":
        return "Xuất sắc";
      case "Gioi":
        return "Giỏi";
      case "Kha":
        return "Khá";
      default:
        return "Không đủ ĐK";
    }
  };

  const filteredList =
    currentStep === 1
      ? hoSoChoDuyet.filter(
          (hs) =>
            hs.hoTenSinhVien.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hs.maSV.includes(searchTerm),
        )
      : ketQuaXepHang?.danhSachXepHang.filter(
          (sv) =>
            sv.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sv.maSV.includes(searchTerm),
        ) || [];

  // ============ RENDER ============
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Ban Chủ nhiệm Khoa
          </h2>
          <p className="text-gray-500 mt-1.5">
            {currentStep === 1 && "Bước 1: Xem danh sách hồ sơ chờ duyệt"}
            {currentStep === 2 && "Bước 2: Xếp hạng và phân bổ học bổng"}
            {currentStep === 3 && "Bước 3: Hoàn thành chốt danh sách"}
          </p>
        </div>
        <div className="flex gap-3">
          {currentStep === 1 && ketQuaXepHang && (
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition-all font-bold"
            >
              <Calculator size={18} /> Xem lại kết quả xếp hạng
            </button>
          )}
          {currentStep === 2 && (
            <>
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl shadow-md transition-all font-bold"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleChotDanhSach}
                disabled={loading || danhSachChon.length === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} /> Chốt danh sách ({danhSachChon.length})
              </button>
            </>
          )}
          {currentStep === 3 && (
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl shadow-md transition-all font-bold"
            >
              ← Quay lại xem kết quả
            </button>
          )}
          <button
            onClick={layDanhSachChoDuyet}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Step 1: Form nhập ngân sách */}
      {currentStep === 1 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calculator className="text-blue-600" size={24} />
            Thiết lập ngân sách và đợt học bổng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mã đợt học bổng
              </label>
              <input
                type="number"
                value={maDot}
                onChange={(e) => setMaDot(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ngân sách phân bổ (VNĐ)
              </label>
              <input
                type="number"
                value={nganSach}
                onChange={(e) => setNganSach(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {nganSach.toLocaleString("vi-VN")} đồng
              </p>
            </div>
          </div>
          <button
            onClick={handleXepHang}
            disabled={loading}
            className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md transition-all font-bold disabled:opacity-50"
          >
            {loading ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <Calculator size={18} />
            )}
            Chạy thuật toán xếp hạng
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {currentStep === 2 && ketQuaXepHang && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-6 rounded-3xl text-white shadow-lg">
            <p className="text-xs font-bold opacity-80 uppercase">Ngân sách</p>
            <h4 className="text-2xl font-black mt-2">
              {ketQuaXepHang.tongNganSach.toLocaleString("vi-VN")} đ
            </h4>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Đã chi tiêu
            </p>
            <h4 className="text-2xl font-black text-gray-800 mt-2">
              {ketQuaXepHang.tongChiTieu.toLocaleString("vi-VN")} đ
            </h4>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Được nhận
            </p>
            <h4 className="text-2xl font-black text-green-600 mt-2">
              {ketQuaXepHang.soLuongDuocNhan} SV
            </h4>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Tổng hồ sơ
            </p>
            <h4 className="text-2xl font-black text-gray-800 mt-2">
              {ketQuaXepHang.tongSoHoSo} SV
            </h4>
          </div>
        </div>
      )}

      {/* Table - Step 1 & 2 */}
      {currentStep !== 3 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Award className="text-blue-600" size={20} />
              {currentStep === 1
                ? "Danh sách hồ sơ chờ duyệt"
                : "Kết quả xếp hạng"}
            </h3>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm MSSV, Họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <Loader
                  className="animate-spin mx-auto text-blue-600"
                  size={40}
                />
                <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
              </div>
            ) : currentStep === 1 ? (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-700">Mã hồ sơ</th>
                    <th className="p-4 font-bold text-gray-700">MSSV</th>
                    <th className="p-4 font-bold text-gray-700">Họ và Tên</th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Lớp
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      GPA
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      ĐRL
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredList.map((hs) => (
                    <tr
                      key={hs.maHoSo}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="p-4 font-semibold text-gray-800">
                        {hs.maHoSo}
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {hs.maSV}
                      </td>
                      <td className="p-4">{hs.hoTenSinhVien}</td>
                      <td className="p-4 text-center">{hs.tenLop}</td>
                      <td className="p-4 text-center font-bold text-blue-600">
                        {hs.gpa != null
                          ? Number(hs.gpa).toLocaleString("vi-VN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""}
                      </td>
                      <td className="p-4 text-center font-bold text-green-600">
                        {hs.diemRenLuyen}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                          {hs.trangThai}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        Không có hồ sơ nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Hạng
                    </th>
                    <th className="p-4 font-bold text-gray-700">MSSV</th>
                    <th className="p-4 font-bold text-gray-700">Họ và Tên</th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Lớp
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      GPA / ĐRL
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Xếp loại
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Mức HB
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Trạng thái
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Chọn
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredList.map((sv) => (
                    <tr
                      key={sv.maHoSo}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        danhSachChon.includes(sv.maHoSo) ? "bg-green-50/30" : ""
                      }`}
                    >
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          {sv.thuHang}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {sv.maSV}
                      </td>
                      <td className="p-4">{sv.hoTen}</td>
                      <td className="p-4 text-center">{sv.tenLop}</td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-blue-600">
                          {sv.gpa != null
                            ? Number(sv.gpa).toLocaleString("vi-VN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : ""}
                        </span>
                        <span className="text-gray-400"> / </span>
                        <span className="font-bold text-green-600">
                          {sv.diemRenLuyen}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getXepLoaiColor(sv.xepLoai)}`}
                        >
                          {getXepLoaiText(sv.xepLoai)}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-gray-800">
                        {sv.mucHocBong.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-4 text-center">
                        {sv.duocNhan ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            Đủ NS
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            Hết NS
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleChon(sv.maHoSo)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mx-auto transition-all ${
                            danhSachChon.includes(sv.maHoSo)
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {danhSachChon.includes(sv.maHoSo) ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {danhSachChon.includes(sv.maHoSo)
                            ? "Đã chọn"
                            : "Chọn"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-gray-500">
                        Không có hồ sơ nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Success + danh sách đã chốt */}
      {currentStep === 3 && ketQuaXepHang && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Đã chốt danh sách thành công!
            </h3>
            <p className="text-gray-600 mb-2">
              Đã chốt{" "}
              <span className="font-bold text-green-600">
                {danhSachChon.length} sinh viên
              </span>{" "}
              để đề xuất lên cấp Trường (Hội đồng) xét duyệt.
            </p>
            <p className="text-sm text-gray-500">
              Trạng thái hồ sơ đã được cập nhật thành "KhoaDeXuat"
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Award className="text-green-600" size={20} />
                Danh sách sinh viên đã chốt đề xuất
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      STT
                    </th>
                    <th className="p-4 font-bold text-gray-700">MSSV</th>
                    <th className="p-4 font-bold text-gray-700">Họ và Tên</th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Lớp
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      GPA / ĐRL
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Xếp loại
                    </th>
                    <th className="p-4 font-bold text-gray-700 text-center">
                      Mức HB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ketQuaXepHang.danhSachXepHang
                    .filter((sv) => danhSachChon.includes(sv.maHoSo))
                    .map((sv, index) => (
                      <tr key={sv.maHoSo} className="bg-green-50/30">
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-800">
                          {sv.maSV}
                        </td>
                        <td className="p-4">{sv.hoTen}</td>
                        <td className="p-4 text-center">{sv.tenLop}</td>
                        <td className="p-4 text-center">
                          <span className="font-bold text-blue-600">
                            {sv.gpa != null
                              ? Number(sv.gpa).toLocaleString("vi-VN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : ""}
                          </span>
                          <span className="text-gray-400"> / </span>
                          <span className="font-bold text-green-600">
                            {sv.diemRenLuyen}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getXepLoaiColor(sv.xepLoai)}`}
                          >
                            {getXepLoaiText(sv.xepLoai)}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-800">
                          {sv.mucHocBong.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-bold transition-all mr-4"
            >
              Quay lại xem kết quả xếp hạng
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setKetQuaXepHang(null);
                setDanhSachChon([]);
                layDanhSachChoDuyet();
                layDanhSachDaDeXuat();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}

      {/* Danh sách đã đề xuất - hiển thị ở tất cả các bước */}
      {hoSoDaDeXuat.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-green-200 overflow-hidden mt-8">
          <div className="p-6 border-b border-green-100 bg-green-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              Danh sách đã đề xuất lên Trường ({hoSoDaDeXuat.length} sinh viên)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Các hồ sơ này đã được chốt và chuyển lên cấp Trường (Hội đồng) xét
              duyệt
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-700 text-center">
                    STT
                  </th>
                  <th className="p-4 font-bold text-gray-700">Mã hồ sơ</th>
                  <th className="p-4 font-bold text-gray-700">MSSV</th>
                  <th className="p-4 font-bold text-gray-700">Họ và Tên</th>
                  <th className="p-4 font-bold text-gray-700 text-center">
                    Lớp
                  </th>
                  <th className="p-4 font-bold text-gray-700 text-center">
                    GPA
                  </th>
                  <th className="p-4 font-bold text-gray-700 text-center">
                    ĐRL
                  </th>
                  <th className="p-4 font-bold text-gray-700 text-center">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hoSoDaDeXuat.map((hs, index) => (
                  <tr
                    key={hs.maHoSo}
                    className="bg-green-50/30 hover:bg-green-50/50 transition-colors"
                  >
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      {hs.maHoSo}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      {hs.maSV}
                    </td>
                    <td className="p-4">{hs.hoTenSinhVien}</td>
                    <td className="p-4 text-center">{hs.tenLop}</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {hs.gpa != null ? Number(hs.gpa).toFixed(2) : ""}
                    </td>
                    <td className="p-4 text-center font-bold text-green-600">
                      {hs.diemRenLuyen}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        {hs.trangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhoaDashboard;
