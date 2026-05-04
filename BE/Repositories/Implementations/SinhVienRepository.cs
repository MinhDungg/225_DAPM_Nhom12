using BE.Data;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Repositories.Implementations;

public class SinhVienRepository : ISinhVienRepository
{
    private readonly AppDbContext _context;

    public SinhVienRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<HashSet<string>> LayDanhSachMaSVTonTaiAsync(IEnumerable<string> danhSachMaSV)
    {
        var maSvHopLe = danhSachMaSV
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct()
            .ToList();

        if (maSvHopLe.Count == 0)
        {
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }

        var tonTai = await _context.SinhViens
            .Where(sv => maSvHopLe.Contains(sv.MaSV))
            .Select(sv => sv.MaSV)
            .ToListAsync();

        return tonTai.ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    public async Task<List<(string MaSV, string HoTen)>> LayDanhSachTheoMaSVAsync(
        IEnumerable<string> danhSachMaSV)
    {
        var maSvHopLe = danhSachMaSV
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct()
            .ToList();

        if (maSvHopLe.Count == 0)
        {
            return new List<(string, string)>();
        }

        return await _context.SinhViens
            .Where(sv => maSvHopLe.Contains(sv.MaSV))
            .Select(sv => new { sv.MaSV, sv.HoTen })
            .AsNoTracking()
            .ToListAsync()
            .ContinueWith(t => t.Result.Select(x => (x.MaSV, x.HoTen)).ToList());
    }

    public async Task<BE.DTOs.Response.SinhVienProfileDTO?> GetProfileAsync(string maSV)
    {
        if (string.IsNullOrWhiteSpace(maSV)) return null;

        var profile = await _context.SinhViens
            .Include(s => s.Lop)
                .ThenInclude(l => l.Khoa)
            .Include(s => s.KetQuaHocTaps)
            .Where(s => s.MaSV == maSV)
            .Select(s => new BE.DTOs.Response.SinhVienProfileDTO
            {
                MaSV = s.MaSV,
                HoTen = s.HoTen,
                NgaySinh = s.NgaySinh,
                Email = s.Email,
                SDT = s.SDT,
                TenLop = s.Lop != null ? s.Lop.TenLop : "",
                TenKhoa = s.Lop != null && s.Lop.Khoa != null ? s.Lop.Khoa.TenKhoa : "",
                // GPA from the latest KetQuaHocTap
                GPA = s.KetQuaHocTaps.OrderByDescending(k => k.NamHoc).ThenByDescending(k => k.HocKy).Select(k => k.GPA).FirstOrDefault(),
                // TinChiKyXet from the latest KetQuaHocTap
                TinChiKyXet = s.KetQuaHocTaps.OrderByDescending(k => k.NamHoc).ThenByDescending(k => k.HocKy).Select(k => k.SoTC).FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        return profile;
    }
}

