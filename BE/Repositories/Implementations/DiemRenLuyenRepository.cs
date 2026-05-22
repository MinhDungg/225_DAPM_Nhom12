using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Repositories.Implementations;

public class DiemRenLuyenRepository : IDiemRenLuyenRepository
{
    private readonly AppDbContext _context;

    public DiemRenLuyenRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task ThemNhieuAsync(IEnumerable<DiemRenLuyen> danhSach)
    {
        return _context.DiemRenLuyens.AddRangeAsync(danhSach);
    }

    public async Task<int?> GetDiemRenLuyenAsync(string maSV, int hocKy, string namHoc)
    {
        var result = await _context.DiemRenLuyens
            .Where(d => d.MaSV == maSV && d.HocKy == hocKy && d.NamHoc == namHoc)
            .Select(d => d.DiemSo)
            .FirstOrDefaultAsync();
        
        return result == 0 ? null : result; // C# FirstOrDefault trả về 0 nếu không tìm thấy int
    }
}

