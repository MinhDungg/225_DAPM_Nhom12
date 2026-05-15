import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Calculator,
  RefreshCw,
  AlertCircle,
  Loader,
  Send,
  Award,
} from "lucide-react";
import khoaService from "../../services/khoaService";
import kinhPhiService from "../../services/kinhPhiService";
import FinalDecisionService from "../../services/finalDecisionService";

const KhoaDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDot, setSelectedDot] = useState(null);
  const [danhSachDot, setDanhSachDot] = useState([]);
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [hoSoChoDuyet, setHoSoChoDuyet] = useState([]);
  const [ketQuaXepHang, setKetQuaXepHang] = useState(null);
  const [danhSachChon, setDanhSachChon] = useState([]);
  const [hoSoDaDeXuat, setHoSoDaDeXuat] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const removeAccents = (str) => {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  useEffect(() => {
    loadDots();
    layDanhSachDaDeXuat();
  }, []);

  useEffect(() => {
    if (!selectedDot) return;
    layDanhSachChoDuyetTheoDot(selectedDot.maDot);
    layPhanBoKinhPhi(selectedDot.maDot);
    setKetQuaXepHang(null);
    setDanhSachChon([]);
  }, [selectedDot]);

  const loadDots = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await FinalDecisionService.layDsDotHocBong();
      if (response.success) {
        setDanhSachDot(
          response.data.filter((dot) => dot.trangThai !== "KhoiTao" && dot.trangThai !== "DaCoDiem"),
        );
      }
    } catch (err) {
      setError("Không thể tải danh sách đợt học bổng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const layDanhSachChoDuyetTheoDot = async (maDot) => {
    try {
      const response = await khoaService.layDanhSachChoDuyetTheoDot(maDot);
      if (response.success) setHoSoChoDuyet(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const layDanhSachDaDeXuat = async () => {
    try {
      const response = await khoaService.layDanhSachDaDeXuat();
      if (response.success) setHoSoDaDeXuat(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const layPhanBoKinhPhi = async (maDot) => {
    try {
      const response = await kinhPhiService.getPhanBoTheoMaDot(maDot);
      if (response.success) {
        setBudgetInfo(response.data);
      }
    } catch (err) {
      setBudgetInfo(null);
      console.error(err);
    }
  };

  const handleXepHang = async () => {
    if (!selectedDot) return;
    setLoading(true);
    setError(null);
    try {
      const response = await khoaService.xepHangVaPhanBo(selectedDot.maDot);
      if (response.success) {
        setKetQuaXepHang(response.data);
        setDanhSachChon(
          response.data.danhSachXepHang
            .filter((sv) => sv.duocNhan)
            .map((sv) => sv.maHoSo),
        );
      }
    } catch (err) {
      setError(err.message || "Không thể xếp hạng.");
    } finally {
      setLoading(false);
    }
  };

  const handleChotDanhSach = async () => {
    if (!selectedDot || danhSachChon.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await khoaService.chotDanhSachDeXuat(
        selectedDot.maDot,
        danhSachChon,
      );
      if (response.success) {
        await layDanhSachDaDeXuat();
        await loadDots(); // Reload danh sách đợt để cập nhật trạng thái
        // setSelectedDot(null); // Quay về trang chủ
        toast.success("Chốt danh sách đề xuất thành công.");
      }
    } catch (err) {
      setError(err.message || "Không thể chốt danh sách.");
    } finally {
      setLoading(false);
    }
  };

  const selectedResults = useMemo(() => {
    if (!ketQuaXepHang) return [];
    return ketQuaXepHang.danhSachXepHang;
  }, [ketQuaXepHang]);

  const dangXetDuyetList = danhSachDot.filter(dot => dot.trangThai === "DangXetDuyet");
  const lichSuList = danhSachDot.filter(dot => dot.trangThai !== "DangXetDuyet");

  const isReadOnly = selectedDot ? selectedDot.trangThai !== "DangXetDuyet" : false;
  
  const pendingList = ketQuaXepHang
    ? selectedResults
    : isReadOnly
      ? hoSoChoDuyet.filter((hs) => hs.trangThai !== "Loai")
      : hoSoChoDuyet;

  // Tính tổng số tiền đã chi cho các hồ sơ đã được duyệt (khi xem lịch sử)
  const tongTienDaChi = useMemo(() => {
    if (!isReadOnly || !hoSoChoDuyet.length) return 0;
    console.log('hoSoChoDuyet:', hoSoChoDuyet); // Debug
    const total = hoSoChoDuyet
      .filter(hs => hs.trangThai !== "Loai" && hs.mucHocBong)
      .reduce((sum, hs) => sum + (Number(hs.mucHocBong) || 0), 0);
    console.log('tongTienDaChi:', total); // Debug
    return total;
  }, [hoSoChoDuyet, isReadOnly]);

  if (!selectedDot) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Ban Chủ nhiệm Khoa</h2>
            <p className="text-gray-500 mt-1">Chọn một đợt học bổng để xem chi tiết</p>
          </div>
          <button onClick={loadDots} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl">
            <RefreshCw size={18} /> Tải lại
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-800 mb-4">Đợt đang xét duyệt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {loading ? (
            <div className="col-span-full p-12 text-center">
              <Loader className="animate-spin mx-auto text-blue-600" size={40} />
            </div>
          ) : dangXetDuyetList.length ? (
            dangXetDuyetList.map((dot) => (
              <button key={dot.maDot} onClick={() => setSelectedDot(dot)} className="text-left bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center"><BookOpen size={22} /></div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">{dot.trangThai}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{dot.loaiDot}</h3>
                <p className="text-gray-500 mt-1">Học kỳ {dot.hocKy} • {dot.namHoc}</p>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">Không có đợt nào đang chờ khoa xét duyệt.</div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Lịch sử xét duyệt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full p-12 text-center">
              <Loader className="animate-spin mx-auto text-blue-600" size={40} />
            </div>
          ) : lichSuList.length ? (
            lichSuList.map((dot) => (
              <button key={dot.maDot} onClick={() => setSelectedDot(dot)} className="text-left bg-gray-50 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 opacity-80 hover:opacity-100">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center"><BookOpen size={22} /></div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-700">{dot.trangThai}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-700">{dot.loaiDot}</h3>
                <p className="text-gray-500 mt-1">Học kỳ {dot.hocKy} • {dot.namHoc}</p>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">Chưa có lịch sử.</div>
          )}
        </div>
      </div>
    );
  }

  // const isReadOnly = selectedDot.trangThai !== "DangXetDuyet";
  // const pendingList = ketQuaXepHang
  //   ? selectedResults
  //   : isReadOnly
  //     ? hoSoChoDuyet.filter((hs) => hs.trangThai !== "Loai")
  //     : hoSoChoDuyet;

  const filteredList = (pendingList || []).filter((hs) => {
    const q = removeAccents(searchQuery);
    return (
      (hs.maSV && removeAccents(hs.maSV).includes(q)) ||
      (hs.hoTen && removeAccents(hs.hoTen).includes(q)) ||
      (hs.hoTenSinhVien && removeAccents(hs.hoTenSinhVien).includes(q)) ||
      (hs.tenLop && removeAccents(hs.tenLop).includes(q)) ||
      (hs.tenKhoa && removeAccents(hs.tenKhoa).includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <button onClick={() => setSelectedDot(null)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-3"><ArrowLeft size={18} /> Quay lại</button>
          <h2 className="text-3xl font-extrabold text-gray-900">{selectedDot.loaiDot}</h2>
          <p className="text-gray-500 mt-1">Học kỳ {selectedDot.hocKy} • {selectedDot.namHoc}</p>
        </div>
        <div className="flex gap-3">
          {!isReadOnly && (
            <>
              <button onClick={handleXepHang} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold disabled:opacity-50">
                {loading ? <Loader className="animate-spin" size={18} /> : <Calculator size={18} />} Duyệt nhanh
              </button>
              <button onClick={handleChotDanhSach} disabled={loading || danhSachChon.length===0} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold disabled:opacity-50">
                <Send size={18} /> Chốt danh sách đề xuất
              </button>
            </>
          )}
        </div>
      </div>

      {budgetInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {isReadOnly ? "Tổng ngân sách Khoa được cấp" : "Tổng kinh phí đã dùng"}
            </p>
            <h4 className="text-2xl font-extrabold text-gray-900 mt-2">
              {isReadOnly
                ? `${tongTienDaChi.toLocaleString("vi-VN")} đ / ${budgetInfo.kinhPhi.toLocaleString("vi-VN")} đ`
                : `${ketQuaXepHang?.tongChiTieu ? ketQuaXepHang.tongChiTieu.toLocaleString("vi-VN") : "0"} đ / ${budgetInfo.kinhPhi.toLocaleString("vi-VN")} đ`}
            </h4>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mức HB loại khá</p>
            <h4 className="text-2xl font-extrabold text-gray-900 mt-2">{budgetInfo.mucHBLoaiKha.toLocaleString("vi-VN")} đ</h4>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"><AlertCircle className="text-red-600" size={20} /><p className="text-red-700 font-medium">{error}</p></div>}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-800">{isReadOnly ? "Danh sách hồ sơ (Chỉ xem - Lịch sử)" : "Danh sách hồ sơ"}</h3>
            <span className="text-sm text-gray-500 ml-2">({filteredList.length} hồ sơ)</span>
          </div>
          <input
            type="text"
            placeholder="Tìm theo MSSV, Tên, Lớp, Khoa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <Loader className="animate-spin mx-auto text-blue-600" size={40} />
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="p-4 text-center">STT</th>
                  <th className="p-4">MSSV</th>
                  <th className="p-4">Họ và Tên</th>
                  <th className="p-4 text-center">Lớp</th>
                  <th className="p-4 text-center">Điểm học tập</th>
                  <th className="p-4 text-center">GPA</th>
                  <th className="p-4 text-center">ĐRL</th>
                  {isReadOnly && <th className="p-4 text-center">Loại học bổng</th>}
                  {isReadOnly && <th className="p-4 text-center">Mức HB</th>}
                  {ketQuaXepHang && <>
                    <th className="p-4 text-center">Xếp loại học bổng</th>
                    <th className="p-4 text-center">Mức HB</th>
                    <th className="p-4 text-center">Trạng thái</th>
                  </>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredList.map((hs, index) => (
                  ketQuaXepHang ? (
                    <tr key={hs.maHoSo}>
                      <td className="p-4 text-center font-semibold text-gray-800">{index + 1}</td>
                      <td className="p-4">{hs.maSV}</td>
                      <td className="p-4">{hs.hoTen}</td>
                      <td className="p-4 text-center">{hs.tenLop}</td>
                      <td className="p-4 text-center">{Number(hs.diemHocTap).toFixed(2)}</td>
                      <td className="p-4 text-center">{Number(hs.gpa).toFixed(2)}</td>
                      <td className="p-4 text-center">{hs.diemRenLuyen}</td>
                      {isReadOnly && <td className="p-4 text-center">{hs.xepLoaiHB || hs.xepLoaiHocBong || hs.XepLoaiHocBong || "—"}</td>}
                      <td className="p-4 text-center">{hs.xepLoai}</td>
                      <td className="p-4 text-center">{hs.mucHocBong.toLocaleString("vi-VN")} đ</td>
                      <td className="p-4 text-center">
                        {hs.duocNhan ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Được nhận</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Hết ngân sách</span>
                        )}
                      </td>
                    </tr>
                  ) : (
                    <tr key={hs.maHoSo}>
                      <td className="p-4 text-center font-semibold text-gray-800">{index + 1}</td>
                      <td className="p-4">{hs.maSV}</td>
                      <td className="p-4">{hs.hoTenSinhVien}</td>
                      <td className="p-4 text-center">{hs.tenLop}</td>
                      <td className="p-4 text-center">{Number(hs.diemHocTap).toFixed(2)}</td>
                      <td className="p-4 text-center">{Number(hs.gpa).toFixed(2)}</td>
                      <td className="p-4 text-center">{hs.diemRenLuyen}</td>
                      {isReadOnly && <td className="p-4 text-center">{hs.xepLoaiHB || hs.xepLoaiHocBong || hs.XepLoaiHocBong || "—"}</td>}
                      {isReadOnly && <td className="p-4 text-center">{hs.mucHocBong ? hs.mucHocBong.toLocaleString("vi-VN") + " đ" : "—"}</td>}
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default KhoaDashboard;
