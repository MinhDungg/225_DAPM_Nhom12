using BE.Data;
using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Helpers;
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
            // Lấy TẤT CẢ hồ sơ (kể cả Loai) để Frontend đếm đúng tổng quân số auto-fill
            // Frontend sẽ tự lọc chỉ hiển thị ChoXet trong bảng ứng viên
            hoSos = await _context.HoSoXetHocBongs
                .Include(h => h.SinhVien)
                    .ThenInclude(sv => sv.Lop)
                .Where(h => h.MaDot == maDot && h.SinhVien.Lop.MaKhoa == canBo.MaKhoa.Value)
                .ToListAsync();
        }

        // Lấy thông tin phân bổ kinh phí để tính mức học bổng
        var phanBoKinhPhi = await _phanBoKinhPhiRepository.LayTheoMaDotVaMaKhoaAsync(maDot, canBo.MaKhoa.Value);
        decimal mucHBLoaiKha = phanBoKinhPhi?.MucHBLoaiKha ?? 0;

        return MapDanhSachChoDuyet(hoSos, mucHBLoaiKha);
    }

    private static List<HoSoChoDuyetResponseDTO> MapDanhSachChoDuyet(List<HoSoXetHocBong> hoSos, decimal mucHBLoaiKha = 0)
    {
        return hoSos
            .GroupBy(h => h.MaSV)
            .Select(g => g
                .OrderByDescending(h => h.NgayNop)
                .ThenByDescending(h => h.MaHoSo)
                .First())
            .Select(h =>
            {
                // Tính mức học bổng dựa trên xếp loại
                decimal? mucHocBong = null;
                if (mucHBLoaiKha > 0 && !string.IsNullOrEmpty(h.XepLoaiHB))
                {
                    mucHocBong = h.XepLoaiHB switch
                    {
                        "XuatSac" => mucHBLoaiKha * 1.4m,
                        "Gioi" => mucHBLoaiKha * 1.2m,
                        "Kha" => mucHBLoaiKha,
                        _ => null
                    };
                }

                return new HoSoChoDuyetResponseDTO
                {
                    MaHoSo = h.MaHoSo,
                    MaSV = h.MaSV,
                    HoTenSinhVien = h.SinhVien.HoTen,
                    TenLop = h.SinhVien.Lop.TenLop,
                    DiemHocTap = h.DiemHocTap,
                    GPA = h.GPA,
                    DiemRenLuyen = h.DiemRenLuyen,
                    XepLoaiHB = h.XepLoaiHB,
                    MucHocBong = mucHocBong ?? h.MucHocBong,
                    NgayNop = h.NgayNop,
                    TrangThai = h.TrangThai ?? "ChoXet"
                };
            })
            .ToList();
    }

    public async Task<XepHangResponseDTO> XepHangVaPhanBoAsync(int maTaiKhoan, XepHangRequestDTO request)
    {
        var canBo = await _context.CanBos.FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);
        if (canBo == null || canBo.MaKhoa == null)
            throw new Exception("Không tìm thấy thông tin cán bộ hoặc khoa");

        // ── Hybrid Flow: Dùng ngân sách & mức chuẩn từ payload, KHÔNG query KHTC ──
        var tongNganSach = request.TongNganSach;
        var mucHBLoaiKha = request.MucHocBongKha;

        if (tongNganSach <= 0)
            throw new Exception("Tổng ngân sách phải lớn hơn 0");
        if (mucHBLoaiKha <= 0)
            throw new Exception("Mức học bổng loại Khá phải lớn hơn 0");
        if (request.ThongKeKhoaHoc == null || !request.ThongKeKhoaHoc.Any())
            throw new Exception("Danh sách thống kê khóa học không được rỗng");

        // ── Bước 1: Truy xuất TOÀN BỘ hồ sơ của Khoa trong đợt ──
        var hoSos = await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Where(h => h.SinhVien.Lop.MaKhoa == canBo.MaKhoa.Value
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

        // ── Bước 2: Tính tổng mẫu số từ payload (Trưởng Khoa đã hiệu chỉnh) ──
        int tongMauSo = request.ThongKeKhoaHoc.Sum(x => x.SoLuongSinhVien);
        if (tongMauSo <= 0)
            throw new Exception("Tổng quân số trong thống kê khóa học phải lớn hơn 0");

        // Tạo lookup: TenKhoa (2 ký tự) -> SoLuongSinhVien
        var khoaHocLookup = request.ThongKeKhoaHoc
            .ToDictionary(x => x.TenKhoa.Trim(), x => x.SoLuongSinhVien);

        // ── Bước 3: Nhóm hồ sơ theo Khóa học (2 ký tự đầu TenLop) ──
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

        foreach (var nhomKhoa in nhomTheoKhoa)
        {
            string maKhoaHoc = nhomKhoa.Key;

            // Lấy quân số từ payload (ưu tiên), fallback về số thực tế trong DB
            int soLuongKhoaNay = khoaHocLookup.TryGetValue(maKhoaHoc, out var soLuong)
                ? soLuong
                : nhomKhoa.Count();

            // Tính ngân sách theo tỷ lệ quân số từ payload
            decimal tyLe = (decimal)soLuongKhoaNay / (decimal)tongMauSo;
            decimal nganSachCuaKhoa = Math.Round(tongNganSach * tyLe, 0);

            // Chỉ rải tiền cho hồ sơ ChoXet
            var danhSachChoXet = nhomKhoa
                .Where(h => h.TrangThai == TrangThaiHocBong.ChoXet)
                .ToList();

            if (!danhSachChoXet.Any())
                continue;

            // Phân loại từng hồ sơ ChoXet
            var danhSachPhanLoai = danhSachChoXet
                .Select(hoSo =>
                {
                    var phanLoai = PhanLoaiHocBong(hoSo.GPA, hoSo.DiemRenLuyen, mucHBLoaiKha);
                    return (HoSo: hoSo, XepLoai: phanLoai.XepLoai, MucHocBong: phanLoai.MucHocBong);
                })
                .ToList();

            var duDieuKien = danhSachPhanLoai
                .Where(x => x.XepLoai != "KhongDuDieuKien")
                .OrderByDescending(x => x.HoSo.DiemHocTap)
                .ThenByDescending(x => x.HoSo.DiemRenLuyen)
                .ToList();

            var khongDuDieuKien = danhSachPhanLoai
                .Where(x => x.XepLoai == "KhongDuDieuKien")
                .OrderByDescending(x => x.HoSo.DiemHocTap)
                .ThenByDescending(x => x.HoSo.DiemRenLuyen)
                .ToList();

            // Rải tiền nội bộ Khóa
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
                    ThuHang = thuHangTrongKhoa++,
                    MaHoSo = item.HoSo.MaHoSo,
                    MaSV = item.HoSo.MaSV,
                    HoTen = item.HoSo.SinhVien.HoTen,
                    TenLop = item.HoSo.SinhVien.Lop.TenLop,
                    KhoaHoc = maKhoaHoc,
                    DiemHocTap = item.HoSo.DiemHocTap,
                    GPA = item.HoSo.GPA,
                    DiemRenLuyen = item.HoSo.DiemRenLuyen,
                    XepLoai = item.XepLoai,
                    MucHocBong = item.MucHocBong,
                    DuocNhan = duocNhan
                });
            }

            foreach (var item in khongDuDieuKien)
            {
                ketQuaChung.Add(new SinhVienXepHangDTO
                {
                    ThuHang = 0,
                    MaHoSo = item.HoSo.MaHoSo,
                    MaSV = item.HoSo.MaSV,
                    HoTen = item.HoSo.SinhVien.HoTen,
                    TenLop = item.HoSo.SinhVien.Lop.TenLop,
                    KhoaHoc = maKhoaHoc,
                    DiemHocTap = item.HoSo.DiemHocTap,
                    GPA = item.HoSo.GPA,
                    DiemRenLuyen = item.HoSo.DiemRenLuyen,
                    XepLoai = item.XepLoai,
                    MucHocBong = 0,
                    DuocNhan = false
                });
            }
        }

        // ── Bước 4: Sắp xếp 3 tầng: DuocNhan ↓ → KhoaHoc ↑ → MaSV ↑ ──
        var danhSachFinal = ketQuaChung
            .OrderByDescending(x => x.DuocNhan)
            .ThenBy(x => x.KhoaHoc)
            .ThenBy(x => x.MaSV)
            .ToList();

        return new XepHangResponseDTO
        {
            TongNganSach = tongNganSach,
            TongChiTieu = tongChiTieu,
            SoLuongDuocNhan = soLuongDuocNhan,
            TongSoHoSo = ketQuaChung.Count,
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

        if (request.DanhSachDeXuat == null || !request.DanhSachDeXuat.Any())
            throw new Exception("Danh sach ho so khong duoc rong");

        var soLuongDaChot = await _hoSoRepository.ChotDanhSachDeXuatAsync(
            canBo.MaKhoa.Value,
            request.MaDot,
            request.DanhSachDeXuat,
            canBo.MaCB
        );

        return new ChotDeXuatResponseDTO
        {
            SoLuongDaChot = soLuongDaChot,
            DanhSachMaHoSo = request.DanhSachDeXuat.Select(x => x.MaHoSo).ToList()
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
            .Where(h => h.TrangThai == TrangThaiHocBong.KhoaDeXuat && h.SinhVien.Lop.MaKhoa == canBo.MaKhoa.Value)
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
