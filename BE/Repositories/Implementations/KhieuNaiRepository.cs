using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Repositories.Implementations;

public class KhieuNaiRepository : IKhieuNaiRepository
{
    private readonly AppDbContext _context;

    public KhieuNaiRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<KhieuNai?> GetByIdAsync(int id)
    {
        return await _context.KhieuNais
            .Include(k => k.HoSoXetHocBong)
            .Include(k => k.CanBoDuyet)
            .FirstOrDefaultAsync(k => k.MaKhieuNai == id);
    }

    public async Task<IEnumerable<KhieuNai>> GetAllAsync()
    {
        return await _context.KhieuNais
            .Include(k => k.HoSoXetHocBong)
            .Include(k => k.CanBoDuyet)
            .OrderByDescending(k => k.NgayGui)
            .ToListAsync();
    }

    public async Task<IEnumerable<KhieuNai>> GetByMaSVAsync(string maSV)
    {
        return await _context.KhieuNais
            .Include(k => k.HoSoXetHocBong)
            .Include(k => k.CanBoDuyet)
            .Where(k => k.HoSoXetHocBong.MaSV == maSV)
            .OrderByDescending(k => k.NgayGui)
            .ToListAsync();
    }

    public async Task AddAsync(KhieuNai khieuNai)
    {
        await _context.KhieuNais.AddAsync(khieuNai);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(KhieuNai khieuNai)
    {
        _context.KhieuNais.Update(khieuNai);
        await _context.SaveChangesAsync();
    }
}