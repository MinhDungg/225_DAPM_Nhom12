using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;

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
}

