using BE.Data;
using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace BE.Services.Implementations;

public class KhoaService : IKhoaService
{
    private readonly IHoSoXetHocBongRepository _hoSoRepository;
    private readonly IPhanBoKinhPhiRepository _phanBoKinhPhiRepository;
    private readonly AppDbContext _context;

    private const int SO_TIN_CHI = 15;

    public KhoaService(IHoSoXetHocBongRepository hoSoRepository, IPhanBoKinhPhiRepository phanBoKinhPhiRepository, AppDbContext context)
    {
        _hoSoRepository = hoSoRepository;
        _phanBoKinhPhiRepository = phanBoKinhPhiRepository;
        _context = context;
    }

    public async Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachChoDuyetAsync(int maTaiKhoan)
    {
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
            return new List<HoSoChoDuyetResponseDTO>();

        var hoSos = await _hoSoRepository.LayDanhSachChoDuyetTheoKhoaAsync(canBo.MaKhoa.Value);

        return MapDanhSachChoDuyet(hoSos);
    }

    public async Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachChoXetTheoDotAsync(int maTaiKhoan, int maDot)
    {
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
            return new List<HoSoChoDuyetResponseDTO>();

        var dot = await _context.DotHocBongs.FirstOrDefaultAsync(d => d.MaDot == maDot);
        var isReadOnly = dot != null && dot.TrangThai != "DangXetDuyet";

        List<HoSoXetHocBong> hoSos;
        if (isReadOnly)
        {
            hoSos = await _context.HoSoXetHocBongs
                .Include(h => h.SinhVien)
                    .ThenInclude(sv => sv.Lop)
                .Where(h => h.MaDot == maDot && h.SinhVien.Lop.MaKhoa == canBo.MaKhoa.Value)
                .ToListAsync();
        }
        else
        {
            hoSos = await _hoSoRepository.LayDanhSachChoXetTheoKhoaVaDotAsync(canBo.MaKhoa.Value, maDot);
        }

        return MapDanhSachChoDuyet(hoSos);
    }

    private static List<HoSoChoDuyetResponseDTO> MapDanhSachChoDuyet(List<HoSoXetHocBong> hoSos)
    {
        return hoSos
            .GroupBy(h => h.MaSV)
            .Select(g => g
                .OrderByDescending(h => h.NgayNop)
                .ThenByDescending(h => h.MaHoSo)
                .First())
            .Select(h => new HoSoChoDuyetResponseDTO
            {
                MaHoSo = h.MaHoSo,
                MaSV = h.MaSV,
                HoTenSinhVien = h.SinhVien.HoTen,
                TenLop = h.SinhVien.Lop.TenLop,
                DiemHocTap = h.DiemHocTap,
                GPA = h.GPA,
                DiemRenLuyen = h.DiemRenLuyen,
                XepLoaiHB = h.XepLoaiHB,
                NgayNop = h.NgayNop,
                TrangThai = h.TrangThai ?? "ChoXet"
            })
            .ToList();
    }

    public async Task<XepHangResponseDTO> XepHangVaPhanBoAsync(int maTaiKhoan, XepHangRequestDTO request)
    {
        var canBo = await _context.CanBos.FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);
        if (canBo == null || canBo.MaKhoa == null)
            throw new Exception("Không tìm thấy thông tin cán bộ hoặc khoa");

        var phanBoKinhPhi = await _phanBoKinhPhiRepository.LayTheoMaDotVaMaKhoaAsync(request.MaDot, canBo.MaKhoa.Value);
        if (phanBoKinhPhi == null)
            throw new Exception("Khoa chưa được cấp kinh phí cho đợt này");

        var tongNganSach = phanBoKinhPhi.KinhPhi;
        var mucHBLoaiKha = phanBoKinhPhi.MucHBLoaiKha;

        // ── Bước 1: Truy xuất hồ sơ hợp lệ (ChoXet) ──────────
        // TỐI ƯU: Đã gỡ bỏ Include KetQuaHocTap vì không còn cần thiết
        var hoSos = await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Where(h => h.TrangThai == "ChoXet"
                     && h.SinhVien.Lop.MaKhoa == canBo.MaKhoa.Value
                     && h.MaDot == request.MaDot)
            .ToListAsync();

        if (!hoSos.Any())
        {
            return new XepHangResponseDTO
            {
                TongNganSach = tongNganSach, TongChiTieu = 0, SoLuongDuocNhan = 0, TongSoHoSo = 0,
                DanhSachXepHang = new List<SinhVienXepHangDTO>()
            };
        }

        int tongSoHoSo = hoSos.Count;

        // ── Bước 1 (tiếp): Nhóm hồ sơ theo Khóa học (2 ký tự đầu TenLop) ─────
        var nhomTheoKhoa = hoSos
            .GroupBy(h =>
            {
                var tenLop = h.SinhVien?.Lop?.TenLop ?? "";
                return tenLop.Length >= 2 ? tenLop.Substring(0, 2) : tenLop;
            })
            .ToList();

        var ketQuaChung = new List<SinhVienXepHangDTO>();
        decimal tongChiTieu = 0;
        int soLuongDuocNhan = 0;

        // ── Bước 2 & 3: Duyệt từng nhóm Khóa ────────────────────────────────────
        foreach (var nhomKhoa in nhomTheoKhoa)
        {
            string maKhoaHoc = nhomKhoa.Key;
            var danhSachTrongKhoa = nhomKhoa.ToList();

            // Bước 2: Tính ngân sách riêng cho Khóa
            decimal tyLe = (decimal)danhSachTrongKhoa.Count / (decimal)tongSoHoSo;
            decimal nganSachCuaKhoa = Math.Round(tongNganSach * tyLe, 0);

            // Bước 3a: Phân loại từng hồ sơ (TỐI ƯU: Không check lại F và Tín chỉ nữa)
            var danhSachPhanLoai = new List<(HoSoXetHocBong HoSo, string XepLoai, decimal MucHocBong)>();

            foreach (var hoSo in danhSachTrongKhoa)
            {
                var (xepLoai, mucHocBong) = PhanLoaiHocBong(hoSo.GPA, hoSo.DiemRenLuyen, mucHBLoaiKha);
                danhSachPhanLoai.Add((hoSo, xepLoai, mucHocBong));
            }

            // Bước 3b: Sắp xếp theo Điểm học tập hệ 10 -> Điểm rèn luyện
            var duDieuKien = danhSachPhanLoai
                .Where(x => x.XepLoai != "KhongDuDieuKien")
                .OrderByDescending(x => x.HoSo.DiemHocTap)   // Tiêu chí 1
                .ThenByDescending(x => x.HoSo.DiemRenLuyen)  // Tiêu chí 2
                .ToList();

            // KhongDuDieuKien giờ đây chỉ là những bạn < 2.5 hoặc ĐRL < 65
            var khongDuDieuKien = danhSachPhanLoai
                .Where(x => x.XepLoai == "KhongDuDieuKien")
                .OrderByDescending(x => x.HoSo.DiemHocTap)
                .ThenByDescending(x => x.HoSo.DiemRenLuyen)
                .ToList();

            // Bước 3c: Rải tiền nội bộ Khóa
            decimal conLaiCuaKhoa = nganSachCuaKhoa;
            int thuHangTrongKhoa = 1;

            foreach (var item in duDieuKien)
            {
                bool duocNhan = false;

                if (item.MucHocBong > 0 && conLaiCuaKhoa >= item.MucHocBong)
                {
                    conLaiCuaKhoa -= item.MucHocBong;
                    tongChiTieu += item.MucHocBong;
                    soLuongDuocNhan++;
                    duocNhan = true;
                }

                ketQuaChung.Add(new SinhVienXepHangDTO
                {
                    ThuHang = thuHangTrongKhoa++, MaHoSo = item.HoSo.MaHoSo, MaSV = item.HoSo.MaSV,
                    HoTen = item.HoSo.SinhVien.HoTen, TenLop = item.HoSo.SinhVien.Lop.TenLop, KhoaHoc = maKhoaHoc,
                    DiemHocTap = item.HoSo.DiemHocTap, GPA = item.HoSo.GPA, DiemRenLuyen = item.HoSo.DiemRenLuyen,
                    XepLoai = item.XepLoai, MucHocBong = item.MucHocBong, DuocNhan = duocNhan
                });
            }

            foreach (var item in khongDuDieuKien)
            {
                ketQuaChung.Add(new SinhVienXepHangDTO
                {
                    ThuHang = 0, MaHoSo = item.HoSo.MaHoSo, MaSV = item.HoSo.MaSV,
                    HoTen = item.HoSo.SinhVien.HoTen, TenLop = item.HoSo.SinhVien.Lop.TenLop, KhoaHoc = maKhoaHoc,
                    DiemHocTap = item.HoSo.DiemHocTap, GPA = item.HoSo.GPA, DiemRenLuyen = item.HoSo.DiemRenLuyen,
                    XepLoai = item.XepLoai, MucHocBong = 0, DuocNhan = false
                });
            }
        }

        // ── Bước 4: Sắp xếp kết quả chung để hiển thị đẹp trên UI ──────────────
        var danhSachFinal = ketQuaChung
            .OrderByDescending(x => x.DuocNhan)
            .ThenByDescending(x => x.DiemHocTap)
            .ThenByDescending(x => x.DiemRenLuyen)
            .ToList();

        return new XepHangResponseDTO
        {
            TongNganSach = tongNganSach,
            TongChiTieu = tongChiTieu,
            SoLuongDuocNhan = soLuongDuocNhan,
            TongSoHoSo = tongSoHoSo,
            DanhSachXepHang = danhSachFinal
        };
    }

    private (string XepLoai, decimal MucHocBong) PhanLoaiHocBong(double gpa, int diemDRL, decimal mucHBLoaiKha)
    {
        if (gpa >= 3.6 && diemDRL >= 90)
            return ("XuatSac", mucHBLoaiKha * 1.4m);

        if (gpa >= 3.2 && diemDRL >= 80)
            return ("Gioi", mucHBLoaiKha * 1.2m);

        if (gpa >= 2.5 && diemDRL >= 65)
            return ("Kha", mucHBLoaiKha);

        return ("KhongDuDieuKien", 0);
    }

    public async Task<PhanBoKinhPhiResponseDTO?> LayPhanBoKinhPhiAsync(int maTaiKhoan, int maDot)
    {
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
            return null;

        var phanBo = await _phanBoKinhPhiRepository.LayTheoMaDotVaMaKhoaAsync(maDot, canBo.MaKhoa.Value);

        if (phanBo == null)
            return null;

        return new PhanBoKinhPhiResponseDTO
        {
            MaPhanBo = phanBo.MaPhanBo,
            MaDot = phanBo.MaDot,
            MaKhoa = phanBo.MaKhoa,
            KinhPhi = phanBo.KinhPhi,
            MucHBLoaiKha = phanBo.MucHBLoaiKha
        };
    }

    public async Task<ChotDeXuatResponseDTO> ChotDanhSachDeXuatAsync(int maTaiKhoan, ChotDeXuatRequestDTO request)
    {
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
            throw new Exception("Khong tim thay thong tin can bo hoac khoa");

        if (request.DanhSachMaHoSo == null || !request.DanhSachMaHoSo.Any())
            throw new Exception("Danh sach ho so khong duoc rong");

        var soLuongDaChot = await _hoSoRepository.ChotDanhSachDeXuatAsync(
            canBo.MaKhoa.Value,
            request.MaDot,
            request.DanhSachMaHoSo,
            canBo.MaCB
        );

        return new ChotDeXuatResponseDTO
        {
            SoLuongDaChot = soLuongDaChot,
            DanhSachMaHoSo = request.DanhSachMaHoSo
        };
    }

    public async Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachDaDeXuatAsync(int maTaiKhoan)
    {
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
            return new List<HoSoChoDuyetResponseDTO>();

        var hoSos = await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Where(h => h.TrangThai == "KhoaDeXuat" && h.SinhVien.Lop.MaKhoa == canBo.MaKhoa.Value)
            .OrderByDescending(h => h.GPA)
            .ThenByDescending(h => h.DiemRenLuyen)
            .ToListAsync();

        var result = hoSos
            .GroupBy(h => h.MaSV)
            .Select(g => g
                .OrderByDescending(h => h.NgayNop)
                .ThenByDescending(h => h.MaHoSo)
                .First())
            .Select(h => new HoSoChoDuyetResponseDTO
            {
                MaHoSo = h.MaHoSo,
                MaSV = h.MaSV,
                HoTenSinhVien = h.SinhVien.HoTen,
                TenLop = h.SinhVien.Lop.TenLop,
                DiemHocTap = h.DiemHocTap,
                GPA = h.GPA,
                DiemRenLuyen = h.DiemRenLuyen,
                XepLoaiHB = h.XepLoaiHB,
                NgayNop = h.NgayNop,
                TrangThai = h.TrangThai ?? "KhoaDeXuat"
            })
            .ToList();

        return result;
    }
}
