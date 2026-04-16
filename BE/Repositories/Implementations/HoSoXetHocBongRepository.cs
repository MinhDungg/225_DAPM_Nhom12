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
}

