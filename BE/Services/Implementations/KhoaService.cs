using BE.Data;
using BE.DTOs.Response;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services.Implementations;

public class KhoaService : IKhoaService
{
    private readonly IHoSoXetHocBongRepository _hoSoRepository;
    private readonly AppDbContext _context;

    public KhoaService(IHoSoXetHocBongRepository hoSoRepository, AppDbContext context)
    {
        _hoSoRepository = hoSoRepository;
        _context = context;
    }

    public async Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachChoDuyetAsync(int maTaiKhoan)
    {
        // Tìm cán bộ từ tài khoản
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
        {
            return new List<HoSoChoDuyetResponseDTO>();
        }

        // Lấy danh sách hồ sơ chờ duyệt của khoa
        var hoSos = await _hoSoRepository.LayDanhSachChoDuyetTheoKhoaAsync(canBo.MaKhoa.Value);

        // Map sang DTO
        var result = hoSos.Select(h => new HoSoChoDuyetResponseDTO
        {
            MaHoSo = h.MaHoSo,
            MaSV = h.MaSV,
            HoTenSinhVien = h.SinhVien.HoTen,
            TenLop = h.SinhVien.Lop.TenLop,
            GPA = h.GPA,
            DiemRenLuyen = h.SinhVien.DiemRenLuyens
                .OrderByDescending(d => d.NamHoc)
                .ThenByDescending(d => d.HocKy)
                .FirstOrDefault()?.DiemSo ?? 0,
            DiemNCKH = h.DiemNCKH,
            DiemHDCD = h.DiemHDCD,
            NgayNop = h.NgayNop,
            TrangThai = h.TrangThai ?? "ChoXet"
        }).ToList();

        return result;
    }
}
