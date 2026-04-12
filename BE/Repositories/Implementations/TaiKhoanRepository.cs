using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Repositories.Implementations;

public class TaiKhoanRepository : ITaiKhoanRepository
{
    private readonly AppDbContext _context;

    public TaiKhoanRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaiKhoan?> LayTheoTenDangNhapAsync(string tenDangNhap)
    {
        return await _context.TaiKhoans
            .Include(t => t.SinhVien)
            .Include(t => t.CanBo)
            .FirstOrDefaultAsync(t => t.TenDangNhap == tenDangNhap);
    }
}
