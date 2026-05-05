using BE.Data;
using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services.Implementations;

public class KhoaService : IKhoaService
{
    private readonly IHoSoXetHocBongRepository _hoSoRepository;
    private readonly AppDbContext _context;

    private const decimal DON_GIA_TIN_CHI = 550000m;
    private const int SO_TIN_CHI = 15;
    private const decimal MUC_SAN = DON_GIA_TIN_CHI * SO_TIN_CHI;
    private const decimal TY_LE_XUAT_SAC = 1.4m;
    private const decimal TY_LE_GIOI = 1.2m;
    private const decimal TY_LE_KHA = 1.0m;

    public KhoaService(IHoSoXetHocBongRepository hoSoRepository, AppDbContext context)
    {
        _hoSoRepository = hoSoRepository;
        _context = context;
    }

    public async Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachChoDuyetAsync(int maTaiKhoan)
    {
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
            return new List<HoSoChoDuyetResponseDTO>();

        var hoSos = await _hoSoRepository.LayDanhSachChoDuyetTheoKhoaAsync(canBo.MaKhoa.Value);

        var result = hoSos.Select(h => new HoSoChoDuyetResponseDTO
        {
            MaHoSo = h.MaHoSo,
            MaSV = h.MaSV,
            HoTenSinhVien = h.SinhVien.HoTen,
            TenLop = h.SinhVien.Lop.TenLop,
            DiemHocTap = h.DiemHocTap,
            GPA = h.GPA,
            DiemRenLuyen = h.DiemRenLuyen,
            NgayNop = h.NgayNop,
            TrangThai = h.TrangThai ?? "ChoXet"
        }).ToList();

        return result;
    }

    public async Task<XepHangResponseDTO> XepHangVaPhanBoAsync(int maTaiKhoan, XepHangRequestDTO request)
    {
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
            throw new Exception("Khong tim thay thong tin can bo hoac khoa");

        var hoSos = await _hoSoRepository.LayDanhSachChoDuyetTheoKhoaVaDotAsync(canBo.MaKhoa.Value, request.MaDot);

        if (!hoSos.Any())
        {
            return new XepHangResponseDTO
            {
                TongNganSach = request.NganSach,
                TongChiTieu = 0,
                SoLuongDuocNhan = 0,
                TongSoHoSo = 0,
                DanhSachXepHang = new List<SinhVienXepHangDTO>()
            };
        }

        var dotHocBong = await _context.DotHocBongs
            .FirstOrDefaultAsync(d => d.MaDot == request.MaDot);

        if (dotHocBong == null)
            throw new Exception("Khong tim thay thong tin dot hoc bong");

        var danhSachXepHang = new List<(HoSoXetHocBong HoSo, string XepLoai, decimal MucHocBong, int DiemDRL, int SoTinChi, string LyDoLoai)>();

        foreach (var hoSo in hoSos)
        {
            int diemDRL = hoSo.DiemRenLuyen;

            var ketQuaHocTap = hoSo.SinhVien.KetQuaHocTaps
                .FirstOrDefault(k => k.HocKy == dotHocBong.HocKy && k.NamHoc == dotHocBong.NamHoc);

            int soTinChi = ketQuaHocTap?.SoTC ?? 0;
            if (soTinChi == 0) soTinChi = SO_TIN_CHI;

            if (soTinChi < SO_TIN_CHI)
            {
                danhSachXepHang.Add((hoSo, "KhongDuDieuKien", 0, diemDRL, soTinChi,
                    $"Khong du {SO_TIN_CHI} tin chi (chi co {soTinChi} TC)"));
                continue;
            }

            bool coDiemF = ketQuaHocTap?.CoDiemF ?? false;
            if (coDiemF)
            {
                danhSachXepHang.Add((hoSo, "KhongDuDieuKien", 0, diemDRL, soTinChi, "Co diem F trong hoc ky"));
                continue;
            }

            var (xepLoai, mucHocBong) = PhanLoaiHocBong(hoSo.GPA, diemDRL);
            string lyDoLoai = xepLoai == "KhongDuDieuKien" ? "Khong du dieu kien GPA hoac DRL" : "";
            danhSachXepHang.Add((hoSo, xepLoai, mucHocBong, diemDRL, soTinChi, lyDoLoai));
        }

        // Tách 2 nhóm: Đủ điều kiện và Không đủ điều kiện
        var danhSachDuDieuKien = danhSachXepHang
            .Where(x => x.XepLoai != "KhongDuDieuKien")
            .OrderByDescending(x => x.HoSo.GPA)
            .ThenByDescending(x => x.DiemDRL)
            .ToList();

        var danhSachKhongDuDieuKien = danhSachXepHang
            .Where(x => x.XepLoai == "KhongDuDieuKien")
            .OrderByDescending(x => x.HoSo.GPA)
            .ThenByDescending(x => x.DiemDRL)
            .ToList();

        decimal tongChiTieu = 0;
        int soLuongDuocNhan = 0;
        var danhSachKetQua = new List<SinhVienXepHangDTO>();

        for (int i = 0; i < danhSachDuDieuKien.Count; i++)
        {
            var item = danhSachDuDieuKien[i];
            bool duocNhan = false;

            if (item.MucHocBong > 0 && tongChiTieu + item.MucHocBong <= request.NganSach)
            {
                tongChiTieu += item.MucHocBong;
                soLuongDuocNhan++;
                duocNhan = true;
            }

            danhSachKetQua.Add(new SinhVienXepHangDTO
            {
                ThuHang = i + 1,
                MaHoSo = item.HoSo.MaHoSo,
                MaSV = item.HoSo.MaSV,
                HoTen = item.HoSo.SinhVien.HoTen,
                TenLop = item.HoSo.SinhVien.Lop.TenLop,
                DiemHocTap = item.HoSo.DiemHocTap,
                GPA = item.HoSo.GPA,
                DiemRenLuyen = item.DiemDRL,
                XepLoai = item.XepLoai,
                MucHocBong = item.MucHocBong,
                DuocNhan = duocNhan
            });
        }

        foreach (var item in danhSachKhongDuDieuKien)
        {
            danhSachKetQua.Add(new SinhVienXepHangDTO
            {
                ThuHang = 0,
                MaHoSo = item.HoSo.MaHoSo,
                MaSV = item.HoSo.MaSV,
                HoTen = item.HoSo.SinhVien.HoTen,
                TenLop = item.HoSo.SinhVien.Lop.TenLop,
                DiemHocTap = item.HoSo.DiemHocTap,
                GPA = item.HoSo.GPA,
                DiemRenLuyen = item.DiemDRL,
                XepLoai = item.XepLoai,
                MucHocBong = 0,
                DuocNhan = false
            });
        }

        return new XepHangResponseDTO
        {
            TongNganSach = request.NganSach,
            TongChiTieu = tongChiTieu,
            SoLuongDuocNhan = soLuongDuocNhan,
            TongSoHoSo = hoSos.Count,
            DanhSachXepHang = danhSachKetQua
        };
    }

    // Dùng GPA (thang 4) để phân loại
    private (string XepLoai, decimal MucHocBong) PhanLoaiHocBong(double gpa, int diemDRL)
    {
        if (gpa >= 3.6 && diemDRL >= 90)
            return ("XuatSac", MUC_SAN * TY_LE_XUAT_SAC);

        if (gpa >= 3.2 && diemDRL >= 80)
            return ("Gioi", MUC_SAN * TY_LE_GIOI);

        if (gpa >= 2.5 && diemDRL >= 70)
            return ("Kha", MUC_SAN * TY_LE_KHA);

        return ("KhongDuDieuKien", 0);
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

        var result = hoSos.Select(h => new HoSoChoDuyetResponseDTO
        {
            MaHoSo = h.MaHoSo,
            MaSV = h.MaSV,
            HoTenSinhVien = h.SinhVien.HoTen,
            TenLop = h.SinhVien.Lop.TenLop,
            DiemHocTap = h.DiemHocTap,
            GPA = h.GPA,
            DiemRenLuyen = h.DiemRenLuyen,
            NgayNop = h.NgayNop,
            TrangThai = h.TrangThai ?? "KhoaDeXuat"
        }).ToList();

        return result;
    }
}