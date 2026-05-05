using BE.Data;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Repositories.Implementations;

public class KhoaRepository : IKhoaRepository
{
    private readonly AppDbContext _context;

    public KhoaRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<bool> TonTaiAsync(int maKhoa)
    {
        return _context.Khoas.AnyAsync(k => k.MaKhoa == maKhoa);
    }

    public async Task<List<(int MaKhoa, string TenKhoa)>> LayTatCaAsync()
    {
        return await _context.Khoas
            .OrderBy(k => k.MaKhoa)
            .Select(k => new { k.MaKhoa, k.TenKhoa })
            .AsNoTracking()
            .ToListAsync()
            .ContinueWith(t => t.Result.Select(x => (x.MaKhoa, x.TenKhoa)).ToList());
    }
}

