import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowLeft, BookOpen, Calculator, RefreshCw,
  AlertCircle, Loader, Send, Award, Settings, TrendingUp,
} from "lucide-react";
import khoaService from "../../services/khoaService";
import FinalDecisionService from "../../services/finalDecisionService";
import { exportKhoaExcel, exportKhoaPdf } from "../../utils/exportUtils";

const KhoaDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDot, setSelectedDot] = useState(null);
  const [danhSachDot, setDanhSachDot] = useState([]);
  const [hoSoChoDuyet, setHoSoChoDuyet] = useState([]);
  const [ketQuaXepHang, setKetQuaXepHang] = useState(null);
  const [danhSachChon, setDanhSachChon] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Hybrid Panel State ──────────────────────────────────────────────────────
  const [tongNganSach, setTongNganSach] = useState("");
  const [mucHocBongKha, setMucHocBongKha] = useState("");
  // { [tenKhoa: string]: string } — value la string de input duoc tu do
  const [thongKeKhoaHoc, setThongKeKhoaHoc] = useState({});

  // ── useMemo: Real-time calculations ────────────────────────────────────────
  const tongQuanSo = useMemo(() => {
    return Object.values(thongKeKhoaHoc).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }, [thongKeKhoaHoc]);

  const nganSachNum = useMemo(() => {
    return parseFloat(String(tongNganSach).replace(/[^0-9.]/g, "")) || 0;
  }, [tongNganSach]);

  // Mang tinh toan real-time: [{ tenKhoa, soLuong, tyLe, kinhPhiDuKien }]
  const thongKeKinhPhi = useMemo(() => {
    return Object.entries(thongKeKhoaHoc)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tenKhoa, soLuongStr]) => {
        const soLuong = Number(soLuongStr) || 0;
        const tyLe = tongQuanSo > 0 ? (soLuong / tongQuanSo) * 100 : 0;
        const kinhPhiDuKien = tongQuanSo > 0 ? nganSachNum * (soLuong / tongQuanSo) : 0;
        return { tenKhoa, soLuong, tyLe, kinhPhiDuKien };
      });
  }, [thongKeKhoaHoc, tongQuanSo, nganSachNum]);

  const handleExport = async (fn) => {
    setExporting(true);
    try { await fn(); }
    catch (e) { alert("Loi xuat file: " + e.message); }
    finally { setExporting(false); }
  };

  const removeAccents = (str) => {
    if (!str) return "";
    return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  useEffect(() => { loadDots(); }, []);

  useEffect(() => {
    if (!selectedDot) return;
    layDanhSachChoDuyetTheoDot(selectedDot.maDot);
    setKetQuaXepHang(null);
    setDanhSachChon([]);
    setTongNganSach("");
    setMucHocBongKha("");
    setThongKeKhoaHoc({});
  }, [selectedDot]);

  // Auto-fill quan so khi danh sach ho so duoc tai
  useEffect(() => {
    if (!hoSoChoDuyet.length) return;
    const counts = {};
    hoSoChoDuyet.forEach((hs) => {
      const tenLop = hs.tenLop || "";
      const khoa = tenLop.length >= 2 ? tenLop.substring(0, 2) : tenLop;
      if (khoa) counts[khoa] = String((Number(counts[khoa]) || 0) + 1);
    });
    setThongKeKhoaHoc(counts);
  }, [hoSoChoDuyet]);

  const loadDots = async () => {
    setLoading(true); setError(null);
    try {
      const res = await FinalDecisionService.layDsDotHocBong();
      if (res.success) setDanhSachDot(res.data.filter((d) => d.trangThai !== "KhoiTao" && d.trangThai !== "DaCoDiem"));
    } catch (err) { setError("Khong the tai danh sach dot hoc bong."); console.error(err); }
    finally { setLoading(false); }
  };

  const layDanhSachChoDuyetTheoDot = async (maDot) => {
    try {
      const res = await khoaService.layDanhSachChoDuyetTheoDot(maDot);
      if (res.success) setHoSoChoDuyet(res.data);
    } catch (err) { console.error(err); }
  };

  const handleXepHang = async () => {
    if (!selectedDot) return;
    const mucKhaNum = parseFloat(String(mucHocBongKha).replace(/[^0-9.]/g, "")) || 0;
    if (nganSachNum <= 0) { setError("Vui long nhap Tong ngan sach hop le."); return; }
    if (mucKhaNum <= 0) { setError("Vui long nhap Muc hoc bong loai Kha hop le."); return; }
    const thongKeArr = thongKeKinhPhi
      .filter((k) => k.soLuong > 0)
      .map((k) => ({ tenKhoa: k.tenKhoa, soLuongSinhVien: k.soLuong }));
    if (!thongKeArr.length) { setError("Chua co du lieu quan so khoa hoc."); return; }

    setLoading(true); setError(null);
    try {
      const res = await khoaService.xepHangVaPhanBo(selectedDot.maDot, nganSachNum, mucKhaNum, thongKeArr);
      if (res.success) {
        setKetQuaXepHang(res.data);
        setDanhSachChon(res.data.danhSachXepHang.filter((sv) => sv.duocNhan).map((sv) => sv.maHoSo));
      }
    } catch (err) { setError(err.message || "Khong the xep hang."); }
    finally { setLoading(false); }
  };

  const handleChotDanhSach = async () => {
    if (!selectedDot || danhSachChon.length === 0) return;
    setLoading(true); setError(null);
    try {
      const danhSachDeXuat = ketQuaXepHang
        ? ketQuaXepHang.danhSachXepHang.filter((sv) => danhSachChon.includes(sv.maHoSo)).map((sv) => ({ maHoSo: sv.maHoSo, mucHocBong: sv.mucHocBong }))
        : danhSachChon.map((maHoSo) => ({ maHoSo, mucHocBong: null }));
      const res = await khoaService.chotDanhSachDeXuat(selectedDot.maDot, danhSachDeXuat);
      if (res.success) { await loadDots(); toast.success("Chot danh sach de xuat thanh cong."); }
    } catch (err) { setError(err.message || "Khong the chot danh sach."); }
    finally { setLoading(false); }
  };

  const selectedResults = useMemo(() => ketQuaXepHang ? ketQuaXepHang.danhSachXepHang : [], [ketQuaXepHang]);

  // ── useMemo: Thong ke thuc te sau khi chay thuat toan ──────────────────────
  // { [tenKhoa]: { count: number, spent: number } }
  const thongKeThucTe = useMemo(() => {
    if (!selectedResults.length) return {};
    return selectedResults
      .filter((sv) => sv.duocNhan)
      .reduce((acc, sv) => {
        const khoa = sv.khoaHoc || "";
        if (!acc[khoa]) acc[khoa] = { count: 0, spent: 0 };
        acc[khoa].count += 1;
        acc[khoa].spent += Number(sv.mucHocBong) || 0;
        return acc;
      }, {});
  }, [selectedResults]);

  // Tong thuc chi va tong SV duoc nhan (dung cho footer)
  const tongThucChi = useMemo(() => Object.values(thongKeThucTe).reduce((s, v) => s + v.spent, 0), [thongKeThucTe]);
  const tongSVDuocNhan = useMemo(() => Object.values(thongKeThucTe).reduce((s, v) => s + v.count, 0), [thongKeThucTe]);
  const dangXetDuyetList = danhSachDot.filter((d) => d.trangThai === "DangXetDuyet");
  const lichSuList = danhSachDot.filter((d) => d.trangThai !== "DangXetDuyet");
  const isReadOnly = selectedDot ? selectedDot.trangThai !== "DangXetDuyet" : false;
  const pendingList = ketQuaXepHang ? selectedResults : hoSoChoDuyet.filter((hs) => hs.trangThai !== "Loai");
  const handleSmartMoneyBlur = (value, setter) => {
  let num = Number(value);
  
  // Nên nếu nhập số từ 1 đến 10.000, hệ thống tự hiểu là đang gõ tắt hàng Triệu.
  if (num > 0 && num <= 10000) {
    setter(num * 1000000);
    } else {
      setter(num); // Nếu người dùng đã gõ đầy đủ số 0 thì giữ nguyên
    }
  };
  const tongTienDaChi = useMemo(() => {
    if (!isReadOnly || !hoSoChoDuyet.length) return 0;
    return hoSoChoDuyet.filter((hs) => hs.trangThai !== "Loai" && hs.mucHocBong).reduce((s, hs) => s + (Number(hs.mucHocBong) || 0), 0);
  }, [hoSoChoDuyet, isReadOnly]);

  // ── Dot selection screen ────────────────────────────────────────────────────
  if (!selectedDot) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Ban Chu nhiem Khoa</h2>
            <p className="text-gray-500 mt-1">Chon mot dot hoc bong de xem chi tiet</p>
          </div>
          <button onClick={loadDots} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl">
            <RefreshCw size={18} /> Tai lai
          </button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"><AlertCircle className="text-red-600" size={20} /><p className="text-red-700 font-medium">{error}</p></div>}
        <h3 className="text-xl font-bold text-gray-800 mb-4">Dot dang xet duyet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {loading ? <div className="col-span-full p-12 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={40} /></div>
            : dangXetDuyetList.length ? dangXetDuyetList.map((dot) => (
              <button key={dot.maDot} onClick={() => setSelectedDot(dot)} className="text-left bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center"><BookOpen size={22} /></div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">{dot.trangThai}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{dot.loaiDot}</h3>
                <p className="text-gray-500 mt-1">Hoc ky {dot.hocKy} - {dot.namHoc}</p>
              </button>
            )) : <div className="col-span-full text-center text-gray-500">Khong co dot nao dang cho khoa xet duyet.</div>}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Lich su xet duyet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading ? <div className="col-span-full p-12 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={40} /></div>
            : lichSuList.length ? lichSuList.map((dot) => (
              <button key={dot.maDot} onClick={() => setSelectedDot(dot)} className="text-left bg-gray-50 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 opacity-80 hover:opacity-100">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center"><BookOpen size={22} /></div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-700">{dot.trangThai}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-700">{dot.loaiDot}</h3>
                <p className="text-gray-500 mt-1">Hoc ky {dot.hocKy} - {dot.namHoc}</p>
              </button>
            )) : <div className="col-span-full text-center text-gray-500">Chua co lich su.</div>}
        </div>
      </div>
    );
  }

  const filteredList = (pendingList || []).filter((hs) => {
    const q = removeAccents(searchQuery);
    return (hs.maSV && removeAccents(hs.maSV).includes(q)) || (hs.hoTen && removeAccents(hs.hoTen).includes(q)) || (hs.hoTenSinhVien && removeAccents(hs.hoTenSinhVien).includes(q)) || (hs.tenLop && removeAccents(hs.tenLop).includes(q));
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <button onClick={() => setSelectedDot(null)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-3">
            <ArrowLeft size={18} /> Quay lai
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900">{selectedDot.loaiDot}</h2>
          <p className="text-gray-500 mt-1">Hoc ky {selectedDot.hocKy} - {selectedDot.namHoc}</p>
        </div>
        {!isReadOnly && (
          <button onClick={handleChotDanhSach} disabled={loading || danhSachChon.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold disabled:opacity-50">
            <Send size={18} /> Chốt danh sách đề xuất
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"><AlertCircle className="text-red-600" size={20} /><p className="text-red-700 font-medium">{error}</p></div>}

      {/* ── Hybrid Config Panel: Grid 1/3 + 2/3 ── */}
      {!isReadOnly && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* LEFT: Cau hinh chung (lg:col-span-1) */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Cau hinh Ngan sach</h3>
            </div>

            {/* Tong ngan sach */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tổng Ngân Sách (VNĐ)
              </label>
              <input 
                type="number" 
                value={tongNganSach}
                onChange={(e) => setTongNganSach(e.target.value)}
                onBlur={(e) => handleSmartMoneyBlur(e.target.value, setTongNganSach)}
                disabled={isReadOnly}
                placeholder="Gõ tắt: 500 ➔ 500,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              {/* Dòng chữ nhỏ màu xanh hiển thị format có dấu phẩy để thầy cô nhìn lại cho chắc chắn */}
              {tongNganSach > 0 && (
                <p className="text-sm text-green-600 mt-1 font-bold">
                  {Number(tongNganSach).toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>

            {/* Ô MỨC HỌC BỔNG LOẠI KHÁ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mức Học Bổng Sàn (Loại Khá)
              </label>
              <input 
                type="number" 
                value={mucHocBongKha}
                onChange={(e) => setMucHocBongKha(e.target.value)}
                onBlur={(e) => handleSmartMoneyBlur(e.target.value, setMucHocBongKha)}
                disabled={isReadOnly}
                placeholder="Gõ tắt: 5 ➔ 5,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              {mucHocBongKha > 0 && (
                <p className="text-sm text-green-600 mt-1 font-bold">
                  {Number(mucHocBongKha).toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>

            {/* Thong ke tong quan so */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-gray-500 mb-1">
                <span>Tong quan so</span>
                <span className="font-bold text-gray-800">{tongQuanSo} SV</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>So khoa hoc</span>
                <span className="font-bold text-gray-800">{thongKeKinhPhi.length} khoa</span>
              </div>
            </div>

            {/* Nut chay thuat toan */}
            <button
              onClick={handleXepHang}
              disabled={loading}
              className="mt-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold disabled:opacity-50 transition-colors w-full"
            >
              {loading ? <Loader className="animate-spin" size={18} /> : <Calculator size={18} />}
              Duyệt nhanh
            </button>
          </div>

          {/* RIGHT: Bang phan bo khoa hoc (lg:col-span-2) */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <TrendingUp size={16} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Phan bo Ngan sach theo Khoa hoc</h3>
              <span className="text-xs text-gray-400 ml-1">(Tu dong tinh real-time)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Khoa</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Quan so</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">SV Nhan</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Ty le</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngan sach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {thongKeKinhPhi.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Chua co du lieu. Vui long chon dot hoc bong.</td></tr>
                  ) : (
                    thongKeKinhPhi.map(({ tenKhoa, soLuong, tyLe, kinhPhiDuKien }) => (
                      <tr key={tenKhoa} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-800">Khoa {tenKhoa}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={thongKeKhoaHoc[tenKhoa] ?? ""}
                            onChange={(e) => setThongKeKhoaHoc((prev) => ({ ...prev, [tenKhoa]: e.target.value }))}
                            disabled={isReadOnly}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {selectedResults.length > 0
                            ? <span className="font-semibold text-gray-800">{thongKeThucTe[tenKhoa]?.count ?? 0} SV</span>
                            : <span className="text-gray-400">-</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {tongQuanSo > 0 ? tyLe.toFixed(1) + "%" : "0%"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {selectedResults.length > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className="text-green-600 font-bold text-sm">
                                {(thongKeThucTe[tenKhoa]?.spent ?? 0).toLocaleString("vi-VN")} d
                              </span>
                              <span className="text-xs text-gray-400">
                                / {tongQuanSo > 0 ? Math.round(kinhPhiDuKien).toLocaleString("vi-VN") : "---"} d
                              </span>
                            </div>
                          ) : (
                            <span className="text-green-600 font-bold">
                              {tongQuanSo > 0 ? Math.round(kinhPhiDuKien).toLocaleString("vi-VN") + " d" : "---"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Footer auto-sum */}
                {thongKeKinhPhi.length > 0 && (
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-4 py-3 text-xs font-extrabold text-gray-700 uppercase">Tong cong</td>
                      <td className="px-4 py-3 text-center text-sm font-extrabold text-gray-800">{tongQuanSo}</td>
                      <td className="px-4 py-3 text-center text-sm font-extrabold text-gray-800">
                        {selectedResults.length > 0 ? <span className="text-green-700">{tongSVDuocNhan} SV</span> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">100%</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {selectedResults.length > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-green-700 font-extrabold text-sm">{tongThucChi.toLocaleString("vi-VN")} d</span>
                            <span className="text-xs text-gray-400">/ {nganSachNum > 0 ? nganSachNum.toLocaleString("vi-VN") : "---"} d</span>
                          </div>
                        ) : (
                          <span className="text-sm font-extrabold text-green-700">
                            {nganSachNum > 0 ? nganSachNum.toLocaleString("vi-VN") + " d" : "---"}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Ket qua xep hang summary */}
      {ketQuaXepHang && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tong kinh phi da dung</p>
            <h4 className="text-xl font-extrabold text-gray-900 mt-1">
              {ketQuaXepHang.tongChiTieu?.toLocaleString("vi-VN")} d
              <span className="text-sm font-normal text-gray-400"> / {ketQuaXepHang.tongNganSach?.toLocaleString("vi-VN")} d</span>
            </h4>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">So SV duoc nhan</p>
            <h4 className="text-xl font-extrabold text-green-700 mt-1">{ketQuaXepHang.soLuongDuocNhan} sinh vien</h4>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tong ho so xet</p>
            <h4 className="text-xl font-extrabold text-gray-900 mt-1">{ketQuaXepHang.tongSoHoSo} ho so</h4>
          </div>
        </div>
      )}

      {/* Lich su: tong tien da chi */}
      {isReadOnly && tongTienDaChi > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tong tien da chi (lich su)</p>
          <h4 className="text-xl font-extrabold text-gray-900 mt-1">{tongTienDaChi.toLocaleString("vi-VN")} d</h4>
        </div>
      )}

      {/* Bang danh sach ho so */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-800">{isReadOnly ? "Danh sach ho so (Chi xem)" : "Danh sach ho so"}</h3>
            <span className="text-sm text-gray-500 ml-2">({filteredList.length} ho so)</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
            <input type="text" placeholder="Tim theo MSSV, Ten, Lop..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500" />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => handleExport(() => exportKhoaExcel(selectedDot?.maDot))} disabled={exporting}
                style={{ background: "#1D6F42", color: "#fff", padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, minWidth: "110px" }}>
                Xuat Excel
              </button>
              <button onClick={() => handleExport(() => exportKhoaPdf(selectedDot?.maDot))} disabled={exporting}
                style={{ background: "#C00", color: "#fff", padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, minWidth: "100px" }}>
                Xuat PDF
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={40} /></div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="p-4 text-center">STT</th>
                  <th className="p-4">MSSV</th>
                  <th className="p-4">Ho va Ten</th>
                  <th className="p-4 text-center">Lop</th>
                  <th className="p-4 text-center">Diem HT</th>
                  <th className="p-4 text-center">GPA</th>
                  <th className="p-4 text-center">DRL</th>
                  {isReadOnly && <th className="p-4 text-center">Loai HB</th>}
                  {isReadOnly && <th className="p-4 text-center">Muc HB</th>}
                  {ketQuaXepHang && (<><th className="p-4 text-center">Xep loai</th><th className="p-4 text-center">Muc HB</th><th className="p-4 text-center">Trang thai</th></>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredList.map((hs, index) =>
                  ketQuaXepHang ? (
                    <tr key={hs.maHoSo} className={hs.duocNhan ? "" : "opacity-60"}>
                      <td className="p-4 text-center font-semibold text-gray-800">{index + 1}</td>
                      <td className="p-4">{hs.maSV}</td>
                      <td className="p-4">{hs.hoTen}</td>
                      <td className="p-4 text-center">{hs.tenLop}</td>
                      <td className="p-4 text-center">{Number(hs.diemHocTap).toFixed(2)}</td>
                      <td className="p-4 text-center">{Number(hs.gpa).toFixed(2)}</td>
                      <td className="p-4 text-center">{hs.diemRenLuyen}</td>
                      <td className="p-4 text-center">{hs.xepLoai}</td>
                      <td className="p-4 text-center text-green-600 font-bold">{Number(hs.mucHocBong).toLocaleString("vi-VN")} d</td>
                      <td className="p-4 text-center">
                        {hs.duocNhan
                          ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Duoc nhan</span>
                          : <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Het ngan sach</span>}
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
                      {isReadOnly && <td className="p-4 text-center">{hs.xepLoaiHB || "---"}</td>}
                      {isReadOnly && <td className="p-4 text-center">{hs.mucHocBong ? Number(hs.mucHocBong).toLocaleString("vi-VN") + " d" : "---"}</td>}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default KhoaDashboard;
