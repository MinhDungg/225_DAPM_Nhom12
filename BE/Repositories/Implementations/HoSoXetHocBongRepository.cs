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

    public async Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaAsync(int maKhoa)
    {
        return await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.DiemRenLuyens)
            .Where(h => h.TrangThai == "ChoXet" && h.SinhVien.Lop.MaKhoa == maKhoa)
            .ToListAsync();
    }

    public async Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaVaDotAsync(int maKhoa, int maDot)
    {
        return await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.DiemRenLuyens)
            .Where(h => h.TrangThai == "ChoXet" 
                     && h.SinhVien.Lop.MaKhoa == maKhoa 
                     && h.MaDot == maDot)
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
}
