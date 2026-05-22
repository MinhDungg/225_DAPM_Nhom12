using BE.Data;
using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Repositories.Implementations;

public class KetQuaHocTapRepository : IKetQuaHocTapRepository
{
    private readonly AppDbContext _context;

    public KetQuaHocTapRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task ThemNhieuAsync(IEnumerable<KetQuaHocTap> danhSach)
    {
        return _context.KetQuaHocTaps.AddRangeAsync(danhSach);
    }

    public async Task<List<UngVienDiemDTO>> LayUngVienDuDieuKienAsync(
        int hocKy,
        string namHoc,
        double minGpa,
        int minSoTc,
        int minDiemRenLuyen)
    {
        return await (
            from kq in _context.KetQuaHocTaps
            join drl in _context.DiemRenLuyens
                on new { kq.MaSV, kq.HocKy, kq.NamHoc } equals new { drl.MaSV, drl.HocKy, drl.NamHoc }
            where kq.HocKy == hocKy
                  && kq.NamHoc == namHoc
                  && kq.GPA >= minGpa
                  && kq.SoTC >= minSoTc
                  && drl.DiemSo >= minDiemRenLuyen
            select new UngVienDiemDTO
            {
                MaSV = kq.MaSV,
                GPA = kq.GPA,
                DiemHocTap = kq.DiemHocTap,
                SoTC = kq.SoTC,
                CoDiemF = kq.CoDiemF,
                DiemRenLuyen = drl.DiemSo
            }).ToListAsync();
    }

    public async Task<List<UngVienDiemDTO>> LayTatCaUngVienTheoKyAsync(int hocKy, string namHoc)
    {
        return await (
            from kq in _context.KetQuaHocTaps
            join drl in _context.DiemRenLuyens
                on new { kq.MaSV, kq.HocKy, kq.NamHoc } equals new { drl.MaSV, drl.HocKy, drl.NamHoc }
            where kq.HocKy == hocKy && kq.NamHoc == namHoc
            select new UngVienDiemDTO
            {
                MaSV = kq.MaSV,
                GPA = kq.GPA,
                DiemHocTap = kq.DiemHocTap,
                SoTC = kq.SoTC,
                CoDiemF = kq.CoDiemF,
                DiemRenLuyen = drl.DiemSo
            }).ToListAsync();
    }
}
