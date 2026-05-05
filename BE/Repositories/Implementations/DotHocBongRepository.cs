using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BE.Repositories.Implementations;

public class DotHocBongRepository : IDotHocBongRepository
{
    private readonly AppDbContext _context;

    public DotHocBongRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DotHocBong> ThemAsync(DotHocBong dotHocBong)
    {
        _context.DotHocBongs.Add(dotHocBong);
        await _context.SaveChangesAsync();
        return dotHocBong;
    }

    public async Task<DotHocBong?> LayTheoIdAsync(int maDot)
    {
        return await _context.DotHocBongs.FirstOrDefaultAsync(d => d.MaDot == maDot);
    }

    public void CapNhat(DotHocBong dotHocBong)
    {
        _context.DotHocBongs.Update(dotHocBong);
    }

    public async Task UpdateAsync(DotHocBong dotHocBong)
    {
        _context.DotHocBongs.Update(dotHocBong);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> XoaAsync(int maDot)
    {
        var dot = await _context.DotHocBongs.FindAsync(maDot);
        if (dot == null) return false;
        _context.DotHocBongs.Remove(dot);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<DotHocBong>> LayDanhSachAsync()
    {
        return await _context.DotHocBongs.ToListAsync();
    }

    public async Task<bool> KiemTraTonTaiHocKyNamHocAsync(int hocKy, string namHoc, int? excludeMaDot = null)
    {
        return await _context.DotHocBongs.AnyAsync(d =>
            d.HocKy == hocKy &&
            d.NamHoc == namHoc &&
            (excludeMaDot == null || d.MaDot != excludeMaDot.Value));
    }
}
