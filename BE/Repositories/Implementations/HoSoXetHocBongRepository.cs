using BE.Data;
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
            .Where(h => h.TrangThai == "ChoXet" && h.SinhVien.Lop.MaKhoa == maKhoa)
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaVaDotAsync(int maKhoa, int maDot)
    {
        return await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Include(h => h.SinhVien.DiemRenLuyens)
            .Where(h => h.TrangThai == "ChoXet" 
                     && h.SinhVien.Lop.MaKhoa == maKhoa 
                     && h.MaDot == maDot)
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

    public async Task<int> ChotDanhSachDeXuatAsync(int maKhoa, int maDot, List<int> danhSachMaHoSo, int maCB)
    {
        // Lấy danh sách hồ sơ cần chốt
        var hoSos = await _context.HoSoXetHocBongs
            .Include(h => h.SinhVien)
                .ThenInclude(sv => sv.Lop)
            .Where(h => danhSachMaHoSo.Contains(h.MaHoSo)
                     && h.MaDot == maDot
                     && h.SinhVien.Lop.MaKhoa == maKhoa
                     && h.TrangThai == "ChoXet")
            .Distinct()
            .ToListAsync();

        // Cập nhật trạng thái và cán bộ duyệt
        foreach (var hoSo in hoSos)
        {
            hoSo.TrangThai = "KhoaDeXuat";
            hoSo.MaCB_Duyet = maCB;
            _context.HoSoXetHocBongs.Update(hoSo);
        }

        await _context.SaveChangesAsync();
        return hoSos.Count;
    }

    /// <summary>
        /// Lấy danh sách hồ sơ xét học bổng theo trạng thái (kèm thông tin Sinh viên và Lớp).
        /// </summary>
      
        public async Task<IEnumerable<HoSoXetHocBong>> GetProfilesByStatusAsync(string status)
        {
            return await _context.HoSoXetHocBongs
                .Include(app => app.SinhVien)
                    .ThenInclude(sv => sv.Lop) // Nối thêm bảng Lớp nếu DTO cần TenLop
                        .ThenInclude(lop => lop.Khoa) // Nối thêm bảng Khoa để lấy TenKhoa
                .Where(app => app.TrangThai == status)
                .AsNoTracking() // Tối ưu hiệu suất vì chỉ đọc dữ liệu (Read-only)
                .ToListAsync();
        }

        
        /// Cập nhật trạng thái cho một danh sách hồ sơ.
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy hồ sơ</returns>
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

    /// <param name="maCB_PheDuyet">Mã cán bộ (Hiệu trưởng) thực hiện phê duyệt</param>
    /// <returns>True nếu giao dịch thành công</returns>
    public async Task<bool> FinalizeScholarshipRoundAsync(int maDot, int maCB_PheDuyet)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Cập nhật trạng thái Đợt học bổng
                var dot = await _context.DotHocBongs.FindAsync(maDot);
                if (dot == null || dot.TrangThai == "ChinhThuc")
                    return false; // Đã chốt rồi hoặc không tồn tại thì bỏ qua

                dot.TrangThai = "ChinhThuc";

                // 2. Lấy danh sách hồ sơ "HoiDongDuyet"
                var confirmedProfiles = await _context.HoSoXetHocBongs
                    .Where(h => h.MaDot == maDot && h.TrangThai == "HoiDongDuyet")
                    .ToListAsync();

                if (confirmedProfiles.Any())
                {
                    // 3. Sao chép dữ liệu sang bảng DSHOCBONG (Snapshot)
                    var dsChinhThuc = confirmedProfiles.Select(h => new DSHocBong
                    {
                        MaDot = h.MaDot,
                        MaSV = h.MaSV,
                        XepLoai = h.XepLoaiHB,
                        SoTien = 0, // Giá trị này sẽ được KH-TC xử lý sau
                        NgayPheDuyet = DateTime.Now,
                        MaCB_PheDuyet = maCB_PheDuyet
                    });

                    await _context.DSHocBongs.AddRangeAsync(dsChinhThuc);

                    // 4. Cập nhật trạng thái hồ sơ gốc
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
