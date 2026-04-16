using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Repositories.Implementations;

public class HoSoXetHocBongRepository : IHoSoXetHocBongRepository
{
    private readonly AppDbContext _context;

    public HoSoXetHocBongRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task XoaHoSoChoXetTheoMaDotAsync(int maDot, string trangThaiChoXet)
    {
        return _context.HoSoXetHocBongs
            .Where(h => h.MaDot == maDot && h.TrangThai == trangThaiChoXet)
            .ExecuteDeleteAsync();
    }

    public Task ThemNhieuAsync(IEnumerable<HoSoXetHocBong> danhSach)
    {
        return _context.HoSoXetHocBongs.AddRangeAsync(danhSach);
    }

    public async Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaAsync(int maKhoa)
    {
        return await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Include(h => h.SinhVien.DiemRenLuyens)
            .Where(h => h.TrangThai == "ChoXet" && h.SinhVien.Lop.MaKhoa == maKhoa)
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaVaDotAsync(int maKhoa, int maDot)
    {
        return await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Include(h => h.SinhVien.DiemRenLuyens)
            .Where(h => h.TrangThai == "ChoXet" 
                     && h.SinhVien.Lop.MaKhoa == maKhoa 
                     && h.MaDot == maDot)
            .Distinct()
            .ToListAsync();
    }

    public async Task CapNhatXepLoaiVaTrangThaiAsync(List<HoSoXetHocBong> hoSos)
    {
        foreach (var hoSo in hoSos)
        {
            _context.HoSoXetHocBongs.Update(hoSo);
        }
        await _context.SaveChangesAsync();
    }

    public async Task<int> ChotDanhSachDeXuatAsync(int maKhoa, int maDot, List<int> danhSachMaHoSo, int maCB)
    {
        // Lấy danh sách hồ sơ cần chốt
        var hoSos = await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Where(h => danhSachMaHoSo.Contains(h.MaHoSo)
                     && h.MaDot == maDot
                     && h.SinhVien.Lop.MaKhoa == maKhoa
                     && h.TrangThai == "ChoXet")
            .Distinct()
            .ToListAsync();

        // Cập nhật trạng thái và cán bộ duyệt
        foreach (var hoSo in hoSos)
        {
            hoSo.TrangThai = "KhoaDeXuat";
            hoSo.MaCB_Duyet = maCB;
            _context.HoSoXetHocBongs.Update(hoSo);
        }

        await _context.SaveChangesAsync();
        return hoSos.Count;
    }
}
