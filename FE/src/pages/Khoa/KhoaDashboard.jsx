import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  RefreshCw,
  AlertCircle,
  Loader,
  Send,
  Award,
  Settings,
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

  // Hybrid Panel State
  const [tongNganSach, setTongNganSach] = useState("");
  const [mucHocBongKha, setMucHocBongKha] = useState("");
  const [thongKeKhoaHoc, setThongKeKhoaHoc] = useState({});

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
      if (khoa) counts[khoa] = (counts[khoa] || 0) + 1;
    });
    setThongKeKhoaHoc(counts);
  }, [hoSoChoDuyet]);

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
      setError("Khong the tai danh sach dot hoc bong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const layDanhSachChoDuyetTheoDot = async (maDot) => {
    try {
      const response = await khoaService.layDanhSachChoDuyetTheoDot(maDot);
      if (response.success) setHoSoChoDuyet(response.data);
    } catch (err) { console.error(err); }
  };

  const handleXepHang = async () => {
    if (!selectedDot) return;
    const nganSachNum = parseFloat(String(tongNganSach).replace(/[^0-9.]/g, ""));
    const mucKhaNum = parseFloat(String(mucHocBongKha).replace(/[^0-9.]/g, ""));
    if (!nganSachNum || nganSachNum <= 0) { setError("Vui long nhap Tong ngan sach hop le."); return; }
    if (!mucKhaNum || mucKhaNum <= 0) { setError("Vui long nhap Muc hoc bong loai Kha hop le."); return; }
    const thongKeArr = Object.entries(thongKeKhoaHoc)
      .filter(([, sl]) => Number(sl) > 0)
      .map(([tenKhoa, soLuong]) => ({ tenKhoa, soLuongSinhVien: Number(soLuong) }));
    if (!thongKeArr.length) { setError("Chua co du lieu quan so khoa hoc."); return; }

    setLoading(true);
    setError(null);
    try {
      const response = await khoaService.xepHangVaPhanBo(selectedDot.maDot, nganSachNum, mucKhaNum, thongKeArr);
      if (response.success) {
        setKetQuaXepHang(response.data);
        setDanhSachChon(response.data.danhSachXepHang.filter((sv) => sv.duocNhan).map((sv) => sv.maHoSo));
      }
    } catch (err) {
      setError(err.message || "Khong the xep hang.");
    } finally {
      setLoading(false);
    }
  };

  const handleChotDanhSach = async () => {
    if (!selectedDot || danhSachChon.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const danhSachDeXuat = ketQuaXepHang
        ? ketQuaXepHang.danhSachXepHang
            .filter((sv) => danhSachChon.includes(sv.maHoSo))
            .map((sv) => ({ maHoSo: sv.maHoSo, mucHocBong: sv.mucHocBong }))
        : danhSachChon.map((maHoSo) => ({ maHoSo, mucHocBong: null }));
      const response = await khoaService.chotDanhSachDeXuat(selectedDot.maDot, danhSachDeXuat);
      if (response.success) {
        await loadDots();
        toast.success("Chot danh sach de xuat thanh cong.");
      }
    } catch (err) {
      setError(err.message || "Khong the chot danh sach.");
    } finally {
      setLoading(false);
    }
  };

  const selectedResults = useMemo(() => {
    if (!ketQuaXepHang) return [];
    return ketQuaXepHang.danhSachXepHang;
  }, [ketQuaXepHang]);

  const dangXetDuyetList = danhSachDot.filter((dot) => dot.trangThai === "DangXetDuyet");
  const lichSuList = danhSachDot.filter((dot) => dot.trangThai !== "DangXetDuyet");
  const isReadOnly = selectedDot ? selectedDot.trangThai !== "DangXetDuyet" : false;

  const pendingList = ketQuaXepHang
    ? selectedResults
    : isReadOnly
      ? hoSoChoDuyet.filter((hs) => hs.trangThai !== "Loai")
      : hoSoChoDuyet;

  const tongTienDaChi = useMemo(() => {
    if (!isReadOnly || !hoSoChoDuyet.length) return 0;
    return hoSoChoDuyet
      .filter((hs) => hs.trangThai !== "Loai" && hs.mucHocBong)
      .reduce((sum, hs) => sum + (Number(hs.mucHocBong) || 0), 0);
  }, [hoSoChoDuyet, isReadOnly]);

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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-800 mb-4">Dot dang xet duyet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {loading ? (
            <div className="col-span-full p-12 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={40} /></div>
          ) : dangXetDuyetList.length ? (
            dangXetDuyetList.map((dot) => (
              <button key={dot.maDot} onClick={() => setSelectedDot(dot)} className="text-left bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center"><BookOpen size={22} /></div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">{dot.trangThai}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{dot.loaiDot}</h3>
                <p className="text-gray-500 mt-1">Hoc ky {dot.hocKy} - {dot.namHoc}</p>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">Khong co dot nao dang cho khoa xet duyet.</div>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Lich su xet duyet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full p-12 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={40} /></div>
          ) : lichSuList.length ? (
            lichSuList.map((dot) => (
              <button key={dot.maDot} onClick={() => setSelectedDot(dot)} className="text-left bg-gray-50 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 opacity-80 hover:opacity-100">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center"><BookOpen size={22} /></div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-700">{dot.trangThai}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-700">{dot.loaiDot}</h3>
                <p className="text-gray-500 mt-1">Hoc ky {dot.hocKy} - {dot.namHoc}</p>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">Chua co lich su.</div>
          )}
        </div>
      </div>
    );
  }

  const filteredList = (pendingList || []).filter((hs) => {
    const q = removeAccents(searchQuery);
    return (
      (hs.maSV && removeAccents(hs.maSV).includes(q)) ||
      (hs.hoTen && removeAccents(hs.hoTen).includes(q)) ||
      (hs.hoTenSinhVien && removeAccents(hs.hoTenSinhVien).includes(q)) ||
      (hs.tenLop && removeAccents(hs.tenLop).includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <button onClick={() => setSelectedDot(null)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-3">
            <ArrowLeft size={18} /> Quay lai
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900">{selectedDot.loaiDot}</h2>
          <p className="text-gray-500 mt-1">Hoc ky {selectedDot.hocKy} - {selectedDot.namHoc}</p>
        </div>
        <div className="flex gap-3">
          {!isReadOnly && (
            <button onClick={handleChotDanhSach} disabled={loading || danhSachChon.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold disabled:opacity-50">
              <Send size={18} /> Chot danh sach de xuat
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {!isReadOnly && (
        <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Settings size={20} className="text-blue-600" />
            <h3 className="text-base font-bold text-gray-800">Cau hinh Ngan sach &amp; Quan so</h3>
            <span className="text-xs text-gray-400 ml-1">(Quan so tu dong dien tu danh sach, ban co the chinh sua)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tong ngan sach (d)</label>
              <input type="text" value={tongNganSach} onChange={(e) => setTongNganSach(e.target.value)}
                placeholder="VD: 50000000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Muc HB loai Kha (d)</label>
              <input type="text" value={mucHocBongKha} onChange={(e) => setMucHocBongKha(e.target.value)}
                placeholder="VD: 1200000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm" />
            </div>
          </div>
          {Object.keys(thongKeKhoaHoc).length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quan so tung Khoa hoc</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(thongKeKhoaHoc).sort(([a], [b]) => a.localeCompare(b)).map(([tenKhoa, soLuong]) => (
                  <div key={tenKhoa} className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 text-center">Khoa {tenKhoa}</label>
                    <input type="number" min="0" value={soLuong}
                      onChange={(e) => setThongKeKhoaHoc((prev) => ({ ...prev, [tenKhoa]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tong quan so: <span className="font-semibold text-gray-600">
                  {Object.values(thongKeKhoaHoc).reduce((s, v) => s + (Number(v) || 0), 0)} sinh vien
                </span>
              </p>
            </div>
          )}
          <div className="mt-5 flex justify-end">
            <button onClick={handleXepHang} disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 transition-colors">
              {loading ? <Loader className="animate-spin" size={18} /> : <Calculator size={18} />}
              Chay thuat toan xep hang
            </button>
          </div>
        </div>
      )}

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

      {isReadOnly && tongTienDaChi > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tong tien da chi (lich su)</p>
          <h4 className="text-xl font-extrabold text-gray-900 mt-1">{tongTienDaChi.toLocaleString("vi-VN")} d</h4>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-800">{isReadOnly ? "Danh sach ho so (Chi xem - Lich su)" : "Danh sach ho so"}</h3>
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
                  {ketQuaXepHang && (
                    <>
                      <th className="p-4 text-center">Xep loai</th>
                      <th className="p-4 text-center">Muc HB</th>
                      <th className="p-4 text-center">Trang thai</th>
                    </>
                  )}
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
                      <td className="p-4 text-center">{Number(hs.mucHocBong).toLocaleString("vi-VN")} d</td>
                      <td className="p-4 text-center">
                        {hs.duocNhan ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Duoc nhan</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Het ngan sach</span>
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
                      {isReadOnly && <td className="p-4 text-center">{hs.xepLoaiHB || "---"}</td>}
                      {isReadOnly && (
                        <td className="p-4 text-center">
                          {hs.mucHocBong ? Number(hs.mucHocBong).toLocaleString("vi-VN") + " d" : "---"}
                        </td>
                      )}
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
