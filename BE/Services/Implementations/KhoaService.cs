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

        var hoSos = await _hoSoRepository.LayDanhSachChoXetTheoKhoaVaDotAsync(canBo.MaKhoa.Value, maDot);

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
                NgayNop = h.NgayNop,
                TrangThai = h.TrangThai ?? "ChoXet"
            })
            .ToList();
    }

    public async Task<XepHangResponseDTO> XepHangVaPhanBoAsync(int maTaiKhoan, XepHangRequestDTO request)
    {
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
            throw new Exception("Khong tim thay thong tin can bo hoac khoa");

        var phanBoKinhPhi = await _phanBoKinhPhiRepository.LayTheoMaDotVaMaKhoaAsync(request.MaDot, canBo.MaKhoa.Value);

        if (phanBoKinhPhi == null)
            throw new Exception("Khoa chưa được cấp kinh phí cho đợt này");

        var tongNganSach = phanBoKinhPhi.KinhPhi;
        var mucHBLoaiKha = phanBoKinhPhi.MucHBLoaiKha;

        var hoSos = await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Where(h => h.TrangThai == "ChoXet" && h.SinhVien.Lop.MaKhoa == canBo.MaKhoa.Value && h.MaDot == request.MaDot)
            .ToListAsync();

        if (!hoSos.Any())
        {
            return new XepHangResponseDTO
            {
                TongNganSach = tongNganSach,
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

        var danhSachXepHang = new List<(HoSoXetHocBong HoSo, string XepLoai, decimal MucHocBong, int DiemDRL, string LyDoLoai)>();

        foreach (var hoSo in hoSos)
        {
            int diemDRL = hoSo.DiemRenLuyen;

            var ketQuaHocTap = hoSo.SinhVien.KetQuaHocTaps
                .FirstOrDefault(k => k.HocKy == dotHocBong.HocKy && k.NamHoc == dotHocBong.NamHoc);

            int soTinChi = ketQuaHocTap?.SoTC ?? 0;
            if (soTinChi == 0) soTinChi = SO_TIN_CHI;

            if (soTinChi < SO_TIN_CHI)
            {
                danhSachXepHang.Add((hoSo, "KhongDuDieuKien", 0, diemDRL,
                    $"Khong du {SO_TIN_CHI} tin chi (chi co {soTinChi} TC)"));
                continue;
            }

            if (ketQuaHocTap?.CoDiemF ?? false)
            {
                danhSachXepHang.Add((hoSo, "KhongDuDieuKien", 0, diemDRL, "Co diem F trong hoc ky"));
                continue;
            }

            var (xepLoai, mucHocBong) = PhanLoaiHocBong(hoSo.GPA, diemDRL, mucHBLoaiKha);
            string lyDoLoai = xepLoai == "KhongDuDieuKien" ? "Khong du dieu kien GPA hoac DRL" : "";
            danhSachXepHang.Add((hoSo, xepLoai, mucHocBong, diemDRL, lyDoLoai));
        }

        var danhSachDuDieuKien = danhSachXepHang
            .Where(x => x.XepLoai != "KhongDuDieuKien")
            .OrderByDescending(x => x.HoSo.DiemHocTap)
            .ThenByDescending(x => x.DiemDRL)
            .ToList();

        var danhSachKhongDuDieuKien = danhSachXepHang
            .Where(x => x.XepLoai == "KhongDuDieuKien")
            .OrderByDescending(x => x.HoSo.DiemHocTap)
            .ThenByDescending(x => x.DiemDRL)
            .ToList();

        decimal tongChiTieu = 0;
        int soLuongDuocNhan = 0;
        var danhSachKetQua = new List<SinhVienXepHangDTO>();

        for (int i = 0; i < danhSachDuDieuKien.Count; i++)
        {
            var item = danhSachDuDieuKien[i];
            bool duocNhan = false;

            if (item.MucHocBong > 0 && tongChiTieu + item.MucHocBong <= tongNganSach)
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
            TongNganSach = tongNganSach,
            TongChiTieu = tongChiTieu,
            SoLuongDuocNhan = soLuongDuocNhan,
            TongSoHoSo = hoSos.Count,
            DanhSachXepHang = danhSachKetQua
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
                NgayNop = h.NgayNop,
                TrangThai = h.TrangThai ?? "KhoaDeXuat"
            })
            .ToList();

        return result;
    }
}
