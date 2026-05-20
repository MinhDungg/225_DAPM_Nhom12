using BE.Data;
using BE.DTOs.Request;
using BE.DTOs.Response;
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

    public Task XoaTatCaHoSoTheoMaDotAsync(int maDot)
    {
        return _context.HoSoXetHocBongs
            .Where(h => h.MaDot == maDot)
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
            .Where(h => h.MaDot > 0
                     && h.TrangThai != null
                     && h.TrangThai.Trim() == "ChoXet"
                     && h.SinhVien.Lop.MaKhoa == maKhoa)
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaVaDotAsync(int maKhoa, int maDot)
    {
        return await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Include(h => h.SinhVien.DiemRenLuyens)
            .Include(h => h.SinhVien.KetQuaHocTaps)
            .Where(h => h.MaDot == maDot
                     && h.TrangThai != null
                     && h.TrangThai.Trim() == "ChoXet"
                     && h.SinhVien.Lop.MaKhoa == maKhoa)
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<HoSoXetHocBong>> LayDanhSachChoXetTheoKhoaVaDotAsync(int maKhoa, int maDot)
    {
        return await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.KetQuaHocTaps)
            .Include(h => h.SinhVien.DiemRenLuyens)
            .Where(h => h.MaDot == maDot
                     && h.TrangThai != null
                     && h.TrangThai.Trim() == "ChoXet"
                     && h.SinhVien.Lop.MaKhoa == maKhoa)
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

    public async Task<int> ChotDanhSachDeXuatAsync(int maKhoa, int maDot, List<HoSoDeXuatItemDTO> danhSachDeXuat, int maCB)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Tạo lookup nhanh: MaHoSo -> MucHocBong
            var mucHocBongLookup = danhSachDeXuat.ToDictionary(x => x.MaHoSo, x => x.MucHocBong);
            var danhSachMaHoSo = danhSachDeXuat.Select(x => x.MaHoSo).ToList();

            var hoSosDuocChon = await _context.HoSoXetHocBongs
                .Include(h => h.SinhVien)
                    .ThenInclude(sv => sv.Lop)
                .Where(h => danhSachMaHoSo.Contains(h.MaHoSo)
                         && h.MaDot == maDot
                         && h.SinhVien.Lop.MaKhoa == maKhoa
                         && h.TrangThai == "ChoXet")
                .Distinct()
                .ToListAsync();

            foreach (var hoSo in hoSosDuocChon)
            {
                hoSo.TrangThai = "KhoaDeXuat";
                hoSo.MaCB_Duyet = maCB;
                hoSo.XepLoaiHB = PhanLoaiHocBong(hoSo.GPA, hoSo.DiemRenLuyen);
                // Lưu số tiền học bổng dự kiến vào database
                if (mucHocBongLookup.TryGetValue(hoSo.MaHoSo, out var mucHB))
                    hoSo.MucHocBong = mucHB;
                _context.HoSoXetHocBongs.Update(hoSo);
            }

            var soHoSoChuyenLoai = await _context.HoSoXetHocBongs
                .Include(h => h.SinhVien)
                    .ThenInclude(sv => sv.Lop)
                .Where(h => h.MaDot == maDot
                         && h.TrangThai == "ChoXet"
                         && !danhSachMaHoSo.Contains(h.MaHoSo)
                         && h.SinhVien.Lop.MaKhoa == maKhoa)
                .ToListAsync();

            foreach (var hoSo in soHoSoChuyenLoai)
            {
                hoSo.TrangThai = "Loai";
                hoSo.MaCB_Duyet = maCB;
                _context.HoSoXetHocBongs.Update(hoSo);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return hoSosDuocChon.Count;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static string PhanLoaiHocBong(double gpa, int diemRenLuyen)
    {
        if (gpa >= 3.6 && diemRenLuyen >= 90)
            return "XuatSac";

        if (gpa >= 3.2 && diemRenLuyen >= 80)
            return "Gioi";

        if (gpa >= 2.5 && diemRenLuyen >= 65)
            return "Kha";

        return "KhongDuDieuKien";
    }

    public async Task<IEnumerable<HoSoXetHocBong>> GetProfilesByStatusAsync(string status)
    {
        return await _context.HoSoXetHocBongs
            .Include(app => app.SinhVien)
                .ThenInclude(sv => sv.Lop)
                    .ThenInclude(lop => lop.Khoa)
            .Where(app => app.TrangThai == status)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<bool> UpdateProfilesStatusAsync(List<int> profileIds, string newStatus)
    {
        if (profileIds == null || !profileIds.Any())
            return false;

        var applications = await _context.HoSoXetHocBongs
            .Where(app => profileIds.Contains(app.MaHoSo))
            .ToListAsync();

        if (!applications.Any())
            return false;

        foreach (var app in applications)
        {
            app.TrangThai = newStatus;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<HoSoXetHocBong>> GetProfilesByMaSVAsync(string maSV)
    {
        return await _context.HoSoXetHocBongs
            .Include(h => h.DotHocBong)
            .Where(h => h.MaSV == maSV)
            .OrderByDescending(h => h.NgayNop)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<HoSoXetHocBong?> GetByIdAsync(int id)
    {
        return await _context.HoSoXetHocBongs.FirstOrDefaultAsync(h => h.MaHoSo == id);
    }

    public async Task<List<UngVienResponseDTO>> LayDanhSachUngVienTheoMaDotAsync(int maDot)
    {
        return await _context.HoSoXetHocBongs
            .Where(h => h.MaDot == maDot)
            .Include(h => h.SinhVien)
            .AsNoTracking()
            .Select(h => new UngVienResponseDTO
            {
                MaSV = h.MaSV,
                HoTen = h.SinhVien.HoTen,
                GPA = h.GPA,
                DiemHocTap = h.DiemHocTap,
                DiemRenLuyen = h.DiemRenLuyen,
                GhiChu = h.GhiChu,
                TrangThai = h.TrangThai
            })
            .OrderBy(h => h.TrangThai)
            .ThenBy(h => h.MaSV)
            .ToListAsync();
    }

    public async Task<bool> FinalizeScholarshipRoundAsync(int maDot, int maCB_PheDuyet)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var dot = await _context.DotHocBongs.FindAsync(maDot);
            if (dot == null || dot.TrangThai == "ChinhThuc")
                return false;

            dot.TrangThai = "ChinhThuc";

            var confirmedProfiles = await _context.HoSoXetHocBongs
                .Where(h => h.MaDot == maDot && h.TrangThai == "HoiDongDuyet")
                .ToListAsync();

            if (confirmedProfiles.Any())
            {
                var dsChinhThuc = confirmedProfiles.Select(h => new DSHocBong
                {
                    MaDot = h.MaDot,
                    MaSV = h.MaSV,
                    XepLoai = h.XepLoaiHB,
                    SoTien = 0,
                    NgayPheDuyet = DateTime.Now,
                    MaCB_PheDuyet = maCB_PheDuyet
                });

                await _context.DSHocBongs.AddRangeAsync(dsChinhThuc);

                foreach (var h in confirmedProfiles)
                {
                    h.TrangThai = "ChinhThuc";
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            return false;
        }
    }

    public async Task DeleteAsync(int maHoSo)
    {
        var hoSo = await _context.HoSoXetHocBongs.FindAsync(maHoSo);
        if (hoSo != null)
        {
            _context.HoSoXetHocBongs.Remove(hoSo);
            await _context.SaveChangesAsync();
        }
    }
}
